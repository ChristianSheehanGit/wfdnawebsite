import { createServer } from 'vite';
globalThis.document = { addEventListener(){}, removeEventListener(){}, getElementById(){return null;}, createElement(){return {style:{},setAttribute(){},appendChild(){}};}, body:{appendChild(){}}, documentElement:{} };
globalThis.window = globalThis;
globalThis.fetch = async()=>{ throw new Error('no-network'); };
globalThis.localStorage = { getItem(){return null;}, setItem(){} };
globalThis.matchMedia = ()=>({matches:false, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){}});
const vite = await createServer({ server:{ middlewareMode:true }, appType:'custom', logLevel:'error' });
try {
  const { ImageProvider } = await vite.ssrLoadModule('/src/ImageContext.jsx');
  const { HashRouter } = await vite.ssrLoadModule('/node_modules/react-router-dom/dist/index.js').catch(()=>({}));
  const RR = (await import('react-router-dom')).default || (await import('react-router-dom'));
  const mod = await vite.ssrLoadModule('/src/Admin.jsx');
  const React = (await import('react')).default;
  const { renderToString } = await import('react-dom/server');
  const tree = React.createElement(ImageProvider, null, React.createElement(RR.HashRouter || RR.MemoryRouter || (x=>x), null, React.createElement(mod.default)));
  const html = renderToString(tree);
  console.log('RENDER OK len', html.length);
} catch(e) {
  console.log('RENDER ERROR:\n', e && e.stack ? e.stack.split('\n').slice(0,8).join('\n') : e);
} finally {
  await vite.close();
}
