const   Koa = require("koa"),
        r = require("koa-route"),
        send = require("koa-send"),
        browserless = require('browserless')();
/*
██╗  ██╗ ██████╗  █████╗ 
██║ ██╔╝██╔═══██╗██╔══██╗
█████╔╝ ██║   ██║███████║
██╔═██╗ ██║   ██║██╔══██║
██║  ██╗╚██████╔╝██║  ██║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
*/
// a server with koa... wooa, something new!
const app = new Koa();
app.use( 
    r.get('/', async (ctx) => {
        await send(ctx, 'index.html', { root: __dirname + '/public' });
    })
);

app.use( 
    r.get('/png', async (ctx) => {
        let url = ctx.request.query.url || 'https://www.source.horse';
        let options = JSON.parse( ctx.request.query.options || null );
        let download = ctx.request.query.download || false;
        let filename = new Buffer.from(url).toString('base64');
        
        let minimal = {
            device: 'iMac 27',
            type: 'png',
            fullPage: true,
            omitBackground: false,
            tmpOpts: {
              path: './public/screenshots/',
              name: `${filename}`,
              enoent: false
            }
          };
        options = Object.assign({}, minimal, options);
        console.info('Shooting', url, 'with options', options);
        const tmpStream = await browserless.screenshot(url, options)
        
        if( download === false ){
            await send(ctx, `screenshots/${filename}.png`, { root: __dirname + '/public' });
            console.log('file delivered (inline)');
            tmpStream.cleanupSync() // It removes the file!
        }else{
            ctx.response.attachment(`${download}.png`);
            await send(ctx, `screenshots/${filename}.png`, { root: __dirname + '/public' });
            console.log(`file delivered (download as "${download}")`);    
            tmpStream.cleanupSync() // It removes the file!
        }
    })
);
// launch our server on the ENV Port or 3000...
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log("Listening on " + port);
});
