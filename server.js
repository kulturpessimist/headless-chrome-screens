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
const shoot = async function(ctx){
        const url = ctx.request.query.url || 'https://www.source.horse';
        let options = JSON.parse( ctx.request.query.options || null );
        const download = ctx.request.query.download || false;
        const filename = new Buffer.from(url).toString('base64');
        const type = ctx.path.indexOf('png')>-1?'png':'jpeg';
        
        let minimal = {
            device: 'iMac 27',
            type: type,
            fullPage: true,
            omitBackground: false,
            tmpOpts: {
                path: './public/screenshots/',
                name: `${filename}`,
                enoent: false
            }
        };
        options = Object.assign({}, minimal, options);
        console.info(`Saving ${url} as ${filename}.${type} with options ${options}`);
        const tmpStream = await browserless.screenshot(url, options)

        if( download === false ){
            await send(ctx, `screenshots/${filename}.${type}`, { root: __dirname + '/public' });
            tmpStream.cleanupSync();
        }else{
            ctx.response.attachment(`${download}.${type}`);
            await send(ctx, `screenshots/${filename}.${type}`, { root: __dirname + '/public' });
            tmpStream.cleanupSync();
        }
}

const app = new Koa();
app.use( 
    r.get('/', async (ctx) => {
        await send(ctx, 'index.html', { root: __dirname + '/public' });
    })
);
app.use( r.get('/png', shoot) );
app.use( r.get('/jpg', shoot) );
app.use( r.get('/jpeg', shoot) );
// launch our server on the ENV Port or 3000...
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log("Listening on " + port);
});
