/* 데이터 계층: Supabase 연결 시 서버 사용, 아니면 이 기기(localStorage)에 임시 저장(미리보기 모드) */
(function(){
  const cfg=window.APP_CONFIG||{};
  const live=!!(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&!/^YOUR_/.test(cfg.SUPABASE_URL)&&window.supabase);
  const sb=live?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}}):null;
  const ls={
    get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
    set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  };
  let cid=ls.get('cid',null);
  if(!cid){cid=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():('c'+Date.now()+Math.random().toString(16).slice(2));ls.set('cid',cid)}

  const fail=e=>({error:(e&&e.message)||'알 수 없는 오류'});
  const rows=r=>r.data||[];

  const API={
    live,
    nick:()=>ls.get('nick',''),
    saveNick:n=>ls.set('nick',n),

    // 처음 한 번: 좋아요 수 / 내가 누른 작품 / 댓글 수
    async init(){
      if(!live){
        const lk=ls.get('d_likes',{}),mine=ls.get('d_mine',[]),cm=ls.get('d_comments',[]),cc={};
        cm.forEach(c=>{if(c.work_id)cc[c.work_id]=(cc[c.work_id]||0)+1});
        return{likes:lk,mine:new Set(mine),comments:cc};
      }
      try{
        const [a,b,c]=await Promise.all([
          sb.rpc('get_like_counts'),sb.rpc('get_my_likes',{p_client:cid}),sb.rpc('get_comment_counts')]);
        if(a.error)throw a.error;
        const likes={},cc={};
        rows(a).forEach(r=>likes[r.work_id]=Number(r.cnt));
        rows(c).forEach(r=>cc[r.work_id]=Number(r.cnt));
        return{likes,mine:new Set(rows(b).map(r=>r.work_id)),comments:cc};
      }catch(e){return{likes:{},mine:new Set(),comments:{},error:e.message}}
    },

    async toggleLike(n){
      if(!live){
        const lk=ls.get('d_likes',{}),mine=new Set(ls.get('d_mine',[]));
        let liked;
        if(mine.has(n)){mine.delete(n);lk[n]=Math.max(0,(lk[n]||1)-1);liked=false}
        else{mine.add(n);lk[n]=(lk[n]||0)+1;liked=true}
        ls.set('d_likes',lk);ls.set('d_mine',[...mine]);
        return{liked,count:lk[n]};
      }
      try{
        const r=await sb.rpc('toggle_like',{p_work:n,p_client:cid});
        if(r.error)throw r.error;
        return{liked:!!r.data.liked,count:Number(r.data.count)};
      }catch(e){return fail(e)}
    },

    async comments(n){
      if(!live)return{list:ls.get('d_comments',[]).filter(c=>c.work_id===n).reverse()};
      try{
        const r=await sb.from('comments').select('id,nickname,body,created_at').eq('work_id',n).order('created_at',{ascending:false}).limit(50);
        if(r.error)throw r.error;return{list:r.data}
      }catch(e){return fail(e)}
    },
    async addComment(n,nickname,body){
      if(!live){
        const all=ls.get('d_comments',[]);const row={id:Date.now(),work_id:n,nickname,body,created_at:new Date().toISOString()};
        all.push(row);ls.set('d_comments',all);return{row};
      }
      try{
        const r=await sb.from('comments').insert({work_id:n,nickname,body}).select('id,nickname,body,created_at').single();
        if(r.error)throw r.error;return{row:r.data}
      }catch(e){return fail(e)}
    },

    async guest(){
      if(!live)return{list:ls.get('d_guest',[]).slice().reverse()};
      try{
        const r=await sb.from('guestbook').select('id,nickname,body,created_at').order('created_at',{ascending:false}).limit(100);
        if(r.error)throw r.error;return{list:r.data}
      }catch(e){return fail(e)}
    },
    async addGuest(nickname,body){
      if(!live){
        const all=ls.get('d_guest',[]);const row={id:Date.now(),nickname,body,created_at:new Date().toISOString()};
        all.push(row);ls.set('d_guest',all);return{row};
      }
      try{
        const r=await sb.from('guestbook').insert({nickname,body}).select('id,nickname,body,created_at').single();
        if(r.error)throw r.error;return{row:r.data}
      }catch(e){return fail(e)}
    }
  };
  window.API=API;
})();
