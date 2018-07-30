const   Koa = require("koa"),
        r = require("koa-route"),
        send = require("koa-send"),
        slugg = require("slugg"),
        ps = require('puppeteer-screenshots');
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
        let filename = slugg(url).substring(0,97);

        let minimal = {url: url, path: `public/screenshots/${filename}.png`};
/*
        --url - (required) the url to take screenshot of 
        --path - (optional) the path to save the screenshot to, default is 'image.png' 
        --viewportWidth - (optional) the viewport width, default value is 1280 pixels
        --viewportHeight - (optional) the viewport height, default value is 768 pixels
        --userAgent - (optional) the user agent to use
        --mobile - (optional) if this is set to true it will use a mobile user agent and set the viewport width to 320px and the viewport height to 480px, note that this overrides viewportWidth, viewportHeight and userAgent
        --pdf - (optional) if true saves the screenshot as pdf
        --mediaTypePrint - (optional) if set emulates the media type as print
        --hide - (optional) a comma separated list of css selectors of elements which to hide using JavaScript, e.g if there are any pop-ups you want to hide
        --visibility (optional) a comma separated list of css selectors of elements which to hide using JavaScript this is different than `hide` in that it sets the visibility property to hidden rather than the display to none
*/
        options = Object.assign({}, minimal, options);
        console.info('Shooting', url, 'with options', options);

        await ps.screenshot(options);
        
        if( download === false ){
            await send(ctx, `screenshots/${filename}.png`, { root: __dirname + '/public' });
            console.log('file delivered (inline)');    
        }else{
            ctx.response.attachment(`${download}.png`);
            await send(ctx, `screenshots/${filename}.png`, { root: __dirname + '/public' });
            console.log(`file delivered (download as "${download}")`);    
        }
    })
);
// launch our server on the ENV Port or 3000...
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log("Listening on " + port);
});
