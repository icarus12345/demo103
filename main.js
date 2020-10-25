var height = 600
var width = 800
var padding = 250
var xTicks = 8
var yTicks = 6
var k = 1;//height / width
var cropable = false
function Point(x,y) {
    this.x = x
    this.y = y
    this.rotate = function(c, angle) {
        
        var radians = (Math.PI / 180) * -angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians);
        return new Point(
            (cos * (this.x - c.x)) + (sin * (this.y - c.y)) + c.x,
            (cos * (this.y - c.y)) - (sin * (this.x - c.x)) + c.y
        )
    }
}
function grid(g, x, y){
    return g
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0.1)
        .call(function(g){
                g
                    .selectAll(".x")
                    .data(x.ticks(xTicks))
                    .join(
                        function (enter) {
                            return enter.append("line").attr("class", "x").attr("y2", height)
                        },
                        function (update){
                            return update
                        },
                        function(exit){
                            return exit.remove()
                        }
                    )
                    .attr("x1", function(d){
                        return 0.5 + x(d)
                    })
                    .attr("x2", function(d){
                        return 0.5 + x(d)
                    })
            })
        .call(function(g){
                g
                    .selectAll(".y")
                    .data(y.ticks(yTicks * k))
                    .join(
                        enter => enter.append("line").attr("class", "y").attr("x2", width),
                        update => update,
                        exit => exit.remove()
                    )
                    .attr("y1", d => 0.5 + y(d))
                    .attr("y2", d => 0.5 + y(d))

            })
}
var line = d3.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })

chart = () => {
    

    var bg = d3.select('.view')
    const drag = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    const zoom = d3.zoom()
        .scaleExtent([1/4, 4])
        .translateExtent([[-padding,-padding],[padding+width,padding+height]])
        .on("zoom", zoomed);

    const svg = d3.select("svg")
        .attr("viewBox", [0, 0, width, height]);

    const defs = svg.append('defs')
    const mask = defs.append('clipPath')
        .attr('id', 'mask')
        // .attr('maskUnits', 'userSpaceOnUse')
    var maskRect=mask
        .append('rect')
        .classed('mask-rect', true)
        .attr('fill', '#fff')
    var maskPath=mask
        .append('path')
        .classed('mask-path', true)
        .attr('fill', '#fff')

    
    

    

    const gGrid = svg.append("g");

 

    const g =svg.append("g")
    

    const gx = svg.append("g");
    const gy = svg.append("g");

    // g.append("circle")
    //     .datum({
    //         x: 0,
    //         y: 0
    //     })
    //     .attr("cx", 0)
    //     .attr("cy", 0)
    //     .attr("r", 50)
    //     .style("fill", "#B8DEE6")
    //     .call(drag);


    var maskImage = g.append('g')
        // .attr('mask', 'url(#mask)')
        .style('clip-path','url(#mask)')
        .append('svg:image')
        


    var gCrop = g.append('g')
    var path = gCrop.append("path")
        .attr("fill", "rgba(0,0,0,0.3)")
        .attr("fill-rule", "nonzero")
        .style("visibility",'hidden')
        .datum([])

    var cropRect = gCrop.append("rect")
        .attr("fill", "rgba(0,0,0,0.01)")
        .attr("stroke", "#00BCD4")
        .attr("stroke-widh", 1)
        .style("visibility",'hidden')
        .call(
            d3.drag()
            .on("drag", function(event,d){


                var x = Math.min(d.maxx - d.w, Math.max(d.minx, event.x))
                var y = Math.min(d.maxy - d.h, Math.max(d.miny, event.y))

                d3.select(this)
                    .attr("x", d.x = x)
                    .attr("y", d.y = y);

                
                drawCropOverlay()
                x1 = crop.x
                y1 = crop.y
                x2 = crop.x + crop.w
                y2 = crop.y + crop.h

                drawControl()
            })
        );

    const gDebug =g.append("g")
    gDebug.append('path')
        .classed('debug',true)
        .classed('line-red',true)
    gDebug.append('path')
        .classed('debug',true)
        .classed('line-green',true)
    function drawCropRect(){
        cropRect.datum(crop)
            .attr("x", d=>d.x)
            .attr("y", d=>d.y)
            .attr("width", d=>d.w)
            .attr("height", d=>d.h)
            .style("visibility", 'visible')
        if(!start && crop) {
            path.style("visibility",crop?'visible':'hidden')
        }
    }
    function drawCropOverlay(){
        path.attr('d', `M${-width * 1.5},${-height * 1.5} h${width * 4} v${height * 4} h-${width * 4} z M${crop.x},${crop.y} v${crop.h} h${crop.w} v-${crop.h} z`)
    }
    var start
    var handlerRect = gCrop.append("rect")
        .datum({})
        .classed('handler', true)
        .attr("fill", "rgba(0,0,0,0.1)")
        .style("x", -width * 1.5)
        .style("y", -height * 1.5)
        .style("width", width * 4)
        .style("height", height * 4)
        .style("visibility",'hidden')
        .call(
            d3.drag()
            .on('start', function(event,d){
                start = {
                    x: event.x,
                    y: event.y
                }
            })
            .on("drag", function(event,d){
                crop = {
                    x: Math.min(event.x, start.x),
                    y: Math.min(event.y, start.y),
                    w: Math.abs(event.x - start.x),
                    h: Math.abs(event.y - start.y),
                }
                drawCropRect()
            })
            .on('end', function(event,d){
                var tlx = Math.max(data.crop.x, Math.min(event.x, start.x))
                var tly = Math.max(data.crop.y, Math.min(event.y, start.y))

                var brx = Math.min(data.crop.x+data.crop.w, Math.max(event.x, start.x))
                var bry = Math.min(data.crop.y+data.crop.h, Math.max(event.y, start.y))

                crop = {
                    x: tlx,
                    y: tly,
                    w: Math.abs(tlx - brx),
                    h: Math.abs(tly - bry),
                    minx: data.crop.x,
                    miny: data.crop.y,
                    maxx: data.crop.x + data.crop.w,
                    maxy: data.crop.y + data.crop.h
                }
                handlerRect.style("visibility",'hidden')
                start = null
                drawCropRect()
                drawCropOverlay()

                x1 = crop.x
                y1 = crop.y
                x2 = crop.x + crop.w
                y2 = crop.y + crop.h

                drawControl()
                circles.style('visibility', 'visible')
            })
        );
        
    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);
    
    var x1= 0, x2= 10,
        y1= 0, y2= 10;
    var controls = [{
        name: 'tl',
        x: function(d){
            return Math.min(x1,x2)
        },
        y: function(d){
            return Math.min(y1,y2)
        },
        move: function(x,y){
            x1 = x
            y1 = y
        },
    },{
        name: 't',
        x: function(d){
            return (x1+x2)/2
        },
        y: function(d){
            return Math.min(y1,y2)
        },
        move: function(x,y){
            y1 = y
        },
    },{
        name: 'tr',
        x: function(d){
            return Math.max(x1,x2)
        },
        y: function(d){
            return Math.min(y1,y2)
        },
        move: function(x,y){
            x2 = x
            y1 = y
        },
    },{
        name: 'r',
        x: function(d){
            return Math.max(x1,x2)
        },
        y: function(d){
            return (y1+y2)/2
        },
        move: function(x,y){
            x2 = x
        },
    },{
        name: 'br',
        x: function(d){
            return Math.max(x1,x2)
        },
        y: function(d){
            return Math.max(y1,y2)
        },
        move: function(x,y){
            x2 = x
            y2 = y
        },
    },{
        name: 'b',
        x: function(d){
            return (x1+x2)/2
        },
        y: function(d){
            return Math.max(y1,y2)
        },
        move: function(x,y){
            y2 = y
        },
    },{
        name: 'bl',
        x: function(d){
            return Math.min(x1,x2)
        },
        y: function(d){
            return Math.max(y1,y2)
        },
        move: function(x,y){
            x1 = x
            y2 = y
        },
    },{
        name: 'l',
        x: function(d){
            return Math.min(x1,x2)
        },
        y: function(d){
            return (y1+y2)/2
        },
        move: function(x,y){
            x1 = x
        },
    }]
    
    var circles = g.append('g')
        .selectAll("circle")
        .data(controls)
        .enter()
        .append('circle')
        .attr('class', function(d){
            return d.name
        })
        .attr('r', 5)
        .attr('fill','red')
        .style('visibility','hidden')
        .call(
            d3.drag()
            .on('drag', function(event, d){
                d.move(event.x,event.y)
                x1 = Math.min(crop.maxx,Math.max(crop.minx, x1))
                x2 = Math.min(crop.maxx,Math.max(crop.minx, x2))
                y1 = Math.min(crop.maxy,Math.max(crop.miny, y1))
                y2 = Math.min(crop.maxy,Math.max(crop.miny, y2))
                drawControl()

                crop.x = Math.min(x1, x2),
                crop.y = Math.min(y1, y2),
                crop.w = Math.abs(x1 - x2),
                crop.h = Math.abs(y1 - y2),
                drawCropRect()
            })
            .on('end', function(event, d){
                if(x2<x1){
                    var tmp = x1;
                    x1 = x2
                    x2 = tmp
                }
                if(y2<y1){
                    var tmp = y1;
                    y1 = y2
                    y2 = tmp
                }
            })
        )
    
    function drawControl(){
        circles
        .attr('cx', function(d){return d.x()})
        .attr('cy', function(d){return d.y()})
        drawCropOverlay()
    }

    function zoomed({
        transform
    }) {
        const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
        const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
        gx.call(xAxis, zx);
        gy.call(yAxis, zy);
        gGrid.call(grid, zx, zy);
        g.attr("transform", transform)//.attr("stroke-width", 5 / transform.k);
        if(circles) circles.attr('r', 5*1/transform.k)
            .attr('stroke-width', 1/transform.k)
    }

    function dragstarted() {
        d3.select(this).raise();
        // g.attr("cursor", "grabbing");
      }
    
      function dragged(event, d) {
        d3.select(this).attr("cx", d.x = event.x).attr("cy", d.y = event.y);
      }
    
      function dragended() {
        // g.attr("cursor", "grab");
      }
    
    var data = {
        w: 0,
        h: 0,
        angle: 0,
        cx: 0,
        cy: 0,
        dx: 0,
        dy: 0,
        crop: {}
    }
    var crop;
    function drawMask(){
        var d = data.crop
        var tl = new Point(d.x, d.y),
            tr = new Point(d.x + d.w, d.y),
            bl = new Point(d.x, d.y + d.h),
            br = new Point(d.x + d.w, d.y + d.h)
            ;
        maskPath
            .datum([tl,tr,br,bl])
            .attr('d', line)
        // maskRect
        //     .attr('x', d=>d.x)
        //     .attr('y', d=>d.y)
        //     .attr('width', d=>d.w)
        //     .attr('height', d=>d.h)
    }
    function rotate(angle){
        
        var d = data.crop
        var center = new Point(d.x + d.w/2, d.y + d.h/2),
            tl = new Point(d.x, d.y).rotate(center, angle),
            tr = new Point(d.x + d.w, d.y).rotate(center, angle),
            bl = new Point(d.x, d.y + d.h).rotate(center, angle),
            br = new Point(d.x + d.w, d.y + d.h).rotate(center, angle)
            ;
        var minx = d3.min([tl,tr,bl,br].map(d=>d.x))
        var maxx = d3.max([tl,tr,bl,br].map(d=>d.x))
        var maxy = d3.max([tl,tr,bl,br].map(d=>d.y))
        var miny = d3.min([tl,tr,bl,br].map(d=>d.y))
        data.crop.x= minx
        data.crop.y= miny
        data.crop.w = Math.abs(maxx-minx)
        data.crop.h = Math.abs(maxy-miny)
        console.log(data)
        data.angle += angle;


        // gDebug.select('.line-green')
        //         .datum([{
        //             x: data.cx,
        //             y: data.cy
        //         },{
        //             x: (data.crop.x + data.crop.w/2),
        //             y: (data.crop.y + data.crop.h/2)
        //         }])
        //         .attr('d', line)
        
        maskImage
            .attr('x', data.dx)
            .attr('y', data.dy)
            .attr('transform', d =>{return `rotate(${d.angle} ${data.dx + data.cx} ${data.dy + data.cy})`})// deg x y
        drawMask()
        // drawCropRect()
    }

    var history = [];
    var index = 0
    return Object.assign(svg.node(), {
        reset() {
            svg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        },
        load(src) {
            var img = new Image()
            img.onload = function(){
                svg.call(zoom).call(zoom.transform, d3.zoomIdentity.translate((width - this.width)/2,(height - this.height)/2));
                data.w = this.width
                data.cx = this.width/2
                data.h = this.height
                data.cy = this.height/2
                data.crop = {
                    x: 0,
                    y: 0,
                    w: this.width,
                    h: this.height,
                }
                maskImage
                    .datum(data)
                    .attr('xlink:href', src)
                    .attr('x',0)
                    .attr('y',0)
                    .attr('width', d=>d.w)
                    .attr('height', d=>d.h )
                    .attr('transform', d =>{return `rotate(${d.angle} ${d.w/2} ${d.h/2})`})// deg x y
                maskRect.datum(data.crop)
                drawMask()
                history[index++] = JSON.stringify(data)
            }
            img.src= src;
        },
        cropable(v) {
            crop = null
            cropable = true
            path.style("visibility",crop?'visible':'hidden')
            handlerRect.style("visibility",cropable?'visible':'hidden')
            d3.selectAll('#apply,#cancel').style('display','')
            d3.selectAll('#crop,#rotate-left,#rotate-right,#undo').style('display','none')
        },
        apply() {
            cropable = false
            var cropCenter = new Point(crop.x + crop.w/2, crop.y + crop.h/2)
            var imageCenter = new Point(data.dx + data.cx, data.dy + data.cy)
            var rotatePoint = cropCenter.rotate(imageCenter, -data.angle)

            // update cx,cy
            data.cx += rotatePoint.x - imageCenter.x
            data.cy += rotatePoint.y - imageCenter.y

            // update dx,dy
            data.dx += cropCenter.x - rotatePoint.x
            data.dy += cropCenter.y - rotatePoint.y

            if(crop) {
                data.crop.x = crop.x
                data.crop.y = crop.y
                data.crop.w = crop.w
                data.crop.h = crop.h
            }
            // gDebug.select('.line-red')
            //     .datum([imageCenter,cropCenter,rotatePoint])
            //     .attr('d', line)

            path.style("visibility",'hidden')
            cropRect.style("visibility",'hidden')
            handlerRect.style("visibility",'hidden')
            drawMask()
            crop = null
            d3.selectAll('#apply,#cancel').style('display','none')
            d3.selectAll('#crop,#rotate-left,#rotate-right,#undo').style('display','')
            circles.style('visibility', 'hidden')
            history[index++] = JSON.stringify(data)
        },
        cancel(){
            cropable = false
            crop = null
            path.style("visibility",'hidden')
            cropRect.style("visibility",'hidden')
            handlerRect.style("visibility",'hidden')
            drawMask()
            d3.selectAll('#apply,#cancel').style('display','none')
            d3.selectAll('#crop,#rotate-left,#rotate-right,#undo').style('display','')
            circles.style('visibility', 'hidden')
        },
        rotateLeft(){
            rotate(-90)
            history[index++] = JSON.stringify(data)
        },
        rotateRight(){
            rotate(+90)
            history[index++] = JSON.stringify(data)
        },
        undo(){
            if(index==0) return;
            index--
            data = JSON.parse(history[index])
            drawMask()
        }
    });
}

x = d3.scaleLinear()
    .domain([0, width])
    .range([0, width])
y = d3.scaleLinear()
    .domain([0 * k, height * k])
    .range([0, height])
z = d3.scaleOrdinal()
    // .domain(data.map(d => d[2]))
    .range(d3.schemeCategory10)
xAxis = (g, x) => g
    .attr("transform", `translate(0, 0)`)
    .call(d3.axisBottom(x).ticks(xTicks))
    // .call(g => g.select(".domain").attr("display", "none"))
yAxis = (g, y) => g
    .call(d3.axisRight(y).ticks(yTicks * k))
    // .call(g => g.select(".domain").attr("display", "none"))
var ch = chart()
ch.reset()
ch.load('https://s3.amazonaws.com/images.seroundtable.com/google-css-images-1515761601.jpg')
d3.select('#crop').on('click',()=>{
    ch.cropable(!cropable)
})
d3.select('#apply').on('click',ch.apply)
d3.select('#cancel').on('click',ch.cancel)
d3.select('#rotate-left').on('click',ch.rotateLeft)
d3.select('#rotate-right').on('click',ch.rotateRight)
d3.select('#undo').on('click',ch.undo)
d3.selectAll('#apply,#cancel').style('display','none')
    
