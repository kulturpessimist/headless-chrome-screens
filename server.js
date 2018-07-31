const   Koa = require("koa"),
        r = require("koa-route"),
        send = require("koa-send"),
        superagent = require('superagent'),
        browserless = require('browserless')();
/*
██╗  ██╗ ██████╗  █████╗ 
██║ ██╔╝██╔═══██╗██╔══██╗
█████╔╝ ██║   ██║███████║
██╔═██╗ ██║   ██║██╔══██║
██║  ██╗╚██████╔╝██║  ██║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
*/
const screenshots = {
    check: async function(url, ctx){
        try{
            const check = await superagent.get(url)
        } catch(e){
            console.log('inline',e);
            return false;
        }
        return true;
    },
    shoot: async function(ctx){
        const url = ctx.request.query.url || 'https://www.source.horse';
        let options = JSON.parse( ctx.request.query.options || null );
        const download = ctx.request.query.download || false;
        const filename = new Buffer.from(url).toString('base64');
        const type = ctx.path.indexOf('png')>-1?'png':'jpeg';
        
        const check = await screenshots.check(url, ctx);
        if(!check){
            await send(ctx, '404.png', { root: __dirname + '/public' });
            return;
        }
        let minimal = {
            // device: 'iMac 27',
            viewport: {
                width:1280,
                height:720,
                deviceScaleFactor:2
            },
            type: type,
            fullPage: false,
            omitBackground: false,
            tmpOpts: {
                path: './public/screenshots/',
                name: `${filename}`,
                enoent: false
            }
        };
        options = Object.assign({}, minimal, options);
        console.info(`Saving ${url} as ${filename}.${type} with options`, options);
        const tmpStream = await browserless.screenshot(url, options)

        if( download === false ){
            await send(ctx, `screenshots/${filename}.${type}`, { root: __dirname + '/public' });
            //tmpStream.cleanupSync();
        }else{
            ctx.response.attachment(`${download}.${type}`);
            await send(ctx, `screenshots/${filename}.${type}`, { root: __dirname + '/public' });
            //tmpStream.cleanupSync();
        }
    },
    index: async function(ctx){
        await send(ctx, 'index.html', { root: __dirname + '/public' });
    }
}

const app = new Koa();
app.use( r.get('/',     screenshots.index) );
app.use( r.get('/png',  screenshots.shoot) );
app.use( r.get('/jpg',  screenshots.shoot) );
app.use( r.get('/jpeg', screenshots.shoot) );
// launch our server on the ENV Port or 3000...
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log("Listening on " + port);
});
