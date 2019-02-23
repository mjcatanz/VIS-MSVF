class anim{
    constructor() {
        this.canvasWidth = document.getElementById('animation').offsetWidth;
        this.canvasHeight = document.getElementById('animation').offsetHeight;
        this.svg = d3.select("#annotation");
        this.pointsGroup = this.svg.append("g")
            .attr("id","pointgroup")

        this.drawFlag = true;
        // this.cp = [[0.25,0.5,1,1],[0.75,0.5,1,1],[0.5,0.5,-1,1]];
        this.cp = [[0.5,0.5,1,1]];
        // this.cp = [[0.25,0.75,1,1],[0.25,0.25,1,1],[0.25,0.5,1,-1],[0.75,0.75,1,1],[0.5,0.75,-1,1]]
        this.sigma = 0.1;

        //// curve ////
        let N = 60; // 25^2 curves
        // discretize the vfield coords
        this.xp = d3.range(N).map(
                function (i) {
                    return i/N;
                });
        this.yp = d3.range(N).map(
                function (i) {
                    return i/N;
                });

        this.xMap = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.canvasWidth]);
        this.yMap = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.canvasHeight]);
        this.cp_local = this.findLocations(this.cp,this.sigma);
        this.cellBound = {"upper":[0.5,0], "lower":[0.5,1]};

        this.edges = this.findEdges(this.cp);
        this.animation("original");

        // this.assginLocation(this.cp, this.cp_local)
       

        this.adbound = false;
        d3.select("#adbound")
            .on("click",()=>{
                if(this.adbound === false){
                    d3.select("#adbound")
                        .attr("class","btn btn-primary")
                        .attr("value","Finish Adjustment")
                    this.adbound = true;
                    this.adjustBound();
                } else { 
                    d3.select("#adbound")
                        .attr("class","btn btn-secondary")
                        .attr("value","Adjust Bound")
                    this.adbound = false;
                }
            })
        
        this.xMapReverse = d3.scaleLinear()
            .domain([0, this.canvasWidth])
            .range([0, 1]);
        this.yMapReverse = d3.scaleLinear()
            .domain([0, this.canvasHeight])
            .range([0, 1]);
            
        this.gradmax = this.maxMesh(this.sigma)

        // console.log(this.grad)
        
    }

    drawAnnotation(){
        let circles = this.pointsGroup.selectAll("circle").data(this.cp)
        circles.exit().remove();
        let newcircles = circles.enter().append("circle")
        circles = newcircles.merge(circles);
        circles
            .attr("cx",(d)=>this.xMap(d[0]))
            .attr("cy",(d)=>this.yMap(d[1]))
            .attr("r",10)
            .attr("fill","red")
            .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            let that=this;

            function dragstarted(d) {
                d3.select(this).raise().classed("active", true);
              }
              
              function dragged(d) {
                // console.log(d3.event)
                d3.select(this).attr("cx", d[0] = that.xMapReverse(d3.event.x)).attr("cy", d[1] = that.yMapReverse(d3.event.y));
                that.cp[0][0] = that.xMapReverse(d3.event.x);
                that.cp[0][1] = that.yMapReverse(d3.event.y);
              }
              
              function dragended(d) {
                d3.select(this).classed("active", false);
                that.grad = that.assginLocation(that.cp, that.cp_local)
                // console.log(that.grad)
              }
              
                // console.log(that.cp_local)

            // if (!mark.node()) {
            //     mark = d3.select("#foreground").append("path").attr("class", "location-mark");
            // }
            // mark.datum({type: "Point", coordinates: coord}).attr("d", path);
        

    }

    adjustBound(){
        document.getElementById("animation").addEventListener("click",event=>{
            if(this.adbound === true){
                this.drawFlag = true;
                let x = this.xMapReverse(event.x);
                let y = this.yMapReverse(event.y);
                console.log("x,y",x,y)
                if(y<=0.5){
                    this.cellBound.upper[0] = x;
                } else { this.cellBound.lower[0] = x;}
            }
                
        })
        
        
    }


    drawCellBound(bound){
        let g = d3.select("#animation").node().getContext("2d");
        g.beginPath();
        g.moveTo(this.xMap(0.5), this.yMap(0.5)); 
        g.lineTo(this.xMap(bound.upper[0]), this.yMap(bound.upper[1]));
        g.lineWidth = 1;
        g.strokeStyle = "white";
        g.stroke();

        g.beginPath();
        g.moveTo(this.xMap(0.5), this.yMap(0.5)); 
        g.lineTo(this.xMap(bound.lower[0]), this.yMap(bound.lower[1]));
        g.lineWidth = 1;
        g.strokeStyle = "white";
        g.stroke();
    }

    F(cp, xIdx, yIdx, sigma){
        // let xIdx = x;
        // let yIdx = y;

        let fx = 0;
        let fy = 0;
        for(let i=0;i<cp.length;i++){
            let point = cp[i];
            // e.g. point = [0.25, 0.25, 1, 1]
            fx += (0.5)*point[2]*Math.exp(-(Math.pow(xIdx-point[0],2)+Math.pow(yIdx-point[1],2))/sigma)
            fy += (0.5)*point[3]*Math.exp(-(Math.pow(xIdx-point[0],2)+Math.pow(yIdx-point[1],2))/sigma)
        }
        return [fx,fy]
    }

    gradF(cp, xIdx, yIdx, sigma){
        let dx = 0;
        let dy = 0;

        for(let i=0;i<cp.length;i++){
            let point = cp[i];
            // e.g. point = [0.25, 0.25, 1, 1]
            dx += point[2] * (1/sigma) * (xIdx-point[0])*Math.exp(-(Math.pow(xIdx-point[0],2)+Math.pow(yIdx-point[1],2))/sigma)
            dy += point[3] * (1/sigma) * (yIdx-point[1]) * (Math.exp(-(Math.pow(xIdx-point[0],2)+Math.pow(yIdx-point[1],2))/sigma))
        }

        return [dx, dy]

    }

    maxMesh(sigma){
        let gradmax = [];
        for(let x=0;x<=1;x+=0.025){
            for(let y=0;y<=1;y+=0.05){
                let dx = (1/sigma) * (x-0.5) * Math.exp(-(Math.pow(x-0.5,2)+Math.pow(y-0.5,2))/sigma);
                let dy = (1/sigma) * (y-0.5) * (Math.exp(-(Math.pow(x-0.5,2)+Math.pow(y-0.5,2))/sigma));
                gradmax.push([x,y,dx,dy]);
            }
        }
        gradmax.sort(function(x,y){
            return d3.ascending(x[0],y[0]) || d3.ascending(x[1],y[1]);
        })
        console.log(gradmax)
        return gradmax;

    }

    assginLocation(cp, cpLocal){
        console.log("cp",cp)
        let xLine = {1:[{"original":[1,1],"local":[1,1]}, {"original":[1,0],"local":[1,0]}], 0:[{"original":[0,0],"local":[0,0]}, {"original":[0,1],"local":[0,1]}]}; // data structure: {idx:[{pt1(local/original)}, {pt2}, {pt3}]}
        let yLine = {1:[{"original":[1,1],"local":[1,1]}, {"original":[0,1],"local":[0,1]}], 0:[{"original":[0,0],"local":[0,0]}, {"original":[1,0],"local":[1,0]}]};

        for(let i=0;i<cp.length;i++){
            let cpLocal_i = this.findMinPt(cp[i],cpLocal);
            if(xLine[cp[i][0]]===undefined){
                xLine[cp[i][0]] = [{"original":[cp[i][0],1], "local":[cpLocal_i[0],1]}, {"original":[cp[i][0],0], "local":[cpLocal_i[0],0]}]; // add terminal point
                yLine[1].push({"original":[cp[i][0],1], "local":[cpLocal_i[0],1]});
                yLine[0].push({"original":[cp[i][0],0], "local":[cpLocal_i[0],0]})
            }
            if(yLine[cp[i][1]]===undefined){
                yLine[cp[i][1]] = [{"original":[1,cp[i][1]], "local":[1,cpLocal_i[1]]},{"original":[0,cp[i][1]], "local":[0,cpLocal_i[1]]}];
                xLine[1].push({"original":[1,cp[i][1]], "local":[1,cpLocal_i[1]]});
                xLine[0].push({"original":[0,cp[i][1]], "local":[0,cpLocal_i[1]]})
            }
            xLine[cp[i][0]].push({"original":cp[i], "local":cpLocal_i});
            yLine[cp[i][1]].push({"original":cp[i], "local":cpLocal_i});
        }
        console.log("xline",xLine)
        console.log("yline",yLine)
        // map vector values
        let grad_new = [];
        let xyVal = [];
        let xVal = Object.keys(xLine).map(Number).sort();
        let yVal = Object.keys(yLine).map(Number).sort();

        let xbp = {}; // begin point
        let xbp_local = {};
        yVal.forEach(y=>{ // horizontal line at y value = y
            xbp[y] = 0;
            xbp_local[y] = 0;
        })
        let ybp = {};
        let ybp_local = {};
        xVal.forEach(x=>{ // vertical line at x value = x
            ybp[x] = 0;
            ybp_local[x] = 0;
        })

        for(let i=0;i<xVal.length;i++){
            let xOriginal = [];
            let xLocal = [];
            xLine[xVal[i]].forEach(e=>{
                xOriginal.push(e.original);
                xLocal.push(e.local);
            })
            xOriginal.sort(function(x,y){
                return d3.ascending(x[1],y[1])
            })
            xLocal.sort(function(x,y){
                return d3.ascending(x[1],y[1])
            })
            for(let j=0;j<yVal.length;j++){
                // console.log("i,j",i,j);
                let yOriginal = [];
                let yLocal = [];
                yLine[yVal[j]].forEach(e=>{
                    yOriginal.push(e.original);
                    yLocal.push(e.local);
                })
                yOriginal.sort(function(x,y){
                    return d3.ascending(x[0],y[0]);
                })
                yLocal.sort(function(x,y){
                    return d3.ascending(x[0],y[0])
                })
                let inter = xOriginal.filter(function(v){
                    let joint = [];
                    yOriginal.forEach(e=>{
                        joint.push(e.join());
                    })
                    return joint.indexOf(v.join()) > -1
                });
                if(inter.length>0){
                    let pt = inter[0]; // e.g. pt = [0.25, 0.5, 1, 1];
                    let pt_local = xLocal.filter(function(v){
                        let joint = [];
                        yLocal.forEach(e=>{
                            joint.push(e.join());
                        })
                        return joint.indexOf(v.join()) > -1
                    })[0];
                    // console.log("intersection",pt, pt_local)
                    // console.log("xbp",xbp)
                    // console.log("xbp_local", xbp_local)
                    // console.log("ybp",ybp)
                    // console.log("ybp_local", ybp_local)
                    let xIdx = xbp[pt[1]];
                    let xIdx_local = xbp_local[pt[1]];
                    let yIdx = ybp[pt[0]];
                    let yIdx_local = ybp_local[pt[0]];
                    let xStep_local = (pt_local[0] - xIdx_local)/(pt[0] - xIdx)*0.025
                    let yStep_local = (pt_local[1] - yIdx_local)/(pt[1] - yIdx)*0.05
                    // console.log("xidx, yidx", xIdx, yIdx)
                    // console.log("xidx loc, yidx loc", xIdx_local, yIdx_local)
                    for(let m=xIdx;m<pt[0];m+=0.025){
                        for(let n=yIdx;n<pt[1];n+=0.05){
                            m = Math.round(m*1000)/1000;
                            n = Math.round(n*1000)/1000;
                            if(xyVal.indexOf([m, n].join())===-1){
                                let currentGrad = this.gradF(cp, xIdx_local, yIdx_local, this.sigma);
                                // console.log("grad",xIdx_local, yIdx_local,currentGrad)
                                currentGrad.push(m);
                                currentGrad.push(n);
                                grad_new.push(currentGrad);
                                xyVal.push([m, n].join());
                            }
                            
                            yIdx_local += yStep_local;
                        }
                        xIdx_local += xStep_local;
                        yIdx_local = ybp_local[pt[0]];
                    }
                    xbp[pt[1]] = pt[0]
                    xbp_local[pt[1]] = pt_local[0]
                    ybp[pt[0]] = pt[1];
                    ybp_local[pt[0]] = pt_local[1];
                }
            }
        }

        grad_new.sort(function(x,y){
            return d3.ascending(x[2],y[2]) || d3.ascending(x[3],y[3])
        })
        // console.log("grad",grad_new)
        return grad_new
    }

    findV(ptt, grad){
        let xIdx = ptt[0];
        let yIdx = ptt[1];
        
        let x1 = Math.floor(xIdx/0.025);
        let x2 = x1+1;
        let y1 = Math.floor(yIdx/0.05);
        let y2 = y1+1;

        let triang = [grad[x1*20+y1], grad[x2*20+y1], grad[x2*20+y2]];

        let ex_v = [0,0]
        for(let i=0;i<3;i++){
            if(typeof triang[i]!="undefined"){
                ex_v[0] += 1/3*triang[i][2]
                ex_v[1] += 1/3*triang[i][3]
            }
        }
        return ex_v;
    }

    animation(type){
        this.clearCanvas()
        this.cp_local = this.findLocations(this.cp,this.sigma);
        this.edges = this.findEdges(this.cp);
        this.grad = this.assginLocation(this.cp, this.cp_local);
            
        let N = 60;
        var dt = 0.001;
        var X0 = [], Y0 = []; // to store initial starting locations
        var X  = [], Y  = []; // to store current point for each curve

        // array of starting positions for each curve on a uniform grid
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                X.push(this.xp[j]), Y.push(this.yp[i]);
                X0.push(this.xp[j]), Y0.push(this.yp[i]);
            }
        }
        // console.log("X",X)
        // console.log("Y",Y)
        function randage() {
            // to randomize starting ages for each curve
            return Math.round(Math.random()*100);
        }

        let g = d3.select("#animation").node().getContext("2d"); // initialize a "canvas" element
        g.fillStyle = "rgba(0, 0, 0, 0.05)"; // for fading curves
        g.lineWidth = 0.7;
        g.strokeStyle = "#FF8000"; // html color code
        //// mapping from vfield coords to web page coords

        

        let that = this;

        //// animation setup
        var frameRate = 500; // ms per timestep (yeah I know it's not really a rate)
        var M = X.length;
        var MaxAge = 200; // # timesteps before restart
        var age = [];
        for (var i=0; i<M; i++) {
            age.push(randage());
        }
        // let drawFlag = this.drawFlag
        setInterval(function () {if (that.drawFlag) {draw(type);}}, frameRate);
        d3.timer(function () {if (that.drawFlag) {draw(type);}}, frameRate);
        d3.select("#annotation")
            .on("click", function() {that.drawFlag = (that.drawFlag) ? false : true;});
            
        g.globalCompositeOperation = "source-over";
        
        function draw(type) {
            let width = document.getElementById('animation').offsetWidth;
            let height = document.getElementById('animation').offsetHeight;
            g.fillStyle = "rgba(0, 0, 0, 0.05)";
            g.fillRect(0, 0, width, height); // fades all existing curves by a set amount determined by fillStyle (above), which sets opacity using rgba
            
            
            // if(type==="original1"){
            //     // that.clearCanvas()
            //     that.drawCellBound(that.cellBound);
            //     that.addnodes(that.cp_local);
            //     that.edges = that.findEdges(that.cp_local);
            //     that.addedges(that.edges)
            // } else {
            //     that.drawCellBound(that.cellBound);
            //     that.addnodes(that.cp);
            //     that.addedges(that.edges)
            // }

            that.drawAnnotation();

            
            for (let i=0; i<M; i++) { // draw a single timestep for every curve
                let dr = [0,0];
                let X_new = X[i];
                let Y_new = Y[i];
                if(type === "original"){ 
                    // dr = that.gradF(that.cp, X[i],Y[i],0.1);
                    
                    // console.log(that.grad)
                    dr = that.findV([X[i]+(0.5-that.cp[0][0]),Y[i]+(0.5-that.cp[0][1])],that.gradmax);

                    // if(X_new>=0 && X_new<=0.5 && Y_new>=0 && Y_new <= 0.5){
                    //     X_new = X_new*(that.cellBound.upper[0]+(0.5-that.cellBound.upper[0])*Y_new/0.5)/0.5
                    // }
                    // else if(X_new>0.5 && X_new<=1 && Y_new>=0 && Y_new <= 0.5){
                    //     X_new = 1-(1-X_new)*((1-2*Y_new)*(0.5-that.cellBound.upper[0])+0.5)/0.5
                    // }
                    // else if(X_new>=0 && X_new<=0.5 && Y_new>0.5 && Y_new <= 1){
                    //     X_new = X_new*(0.5-(2*Y_new-1)*(0.5-that.cellBound.lower[0]))/0.5
                    // }
                    // else if(X_new>0.5 && X_new<=1 && Y_new>0.5 && Y_new <= 1){
                    //     X_new = 1-(1-X_new)*((2*Y_new-1)*(0.5-that.cellBound.lower[0])+0.5)/0.5
                    // }

                    
                }
                else if(type === "original1"){ 
                    dr = that.gradF(that.cp, X[i],Y[i],0.1);
                    // that.calVec(X[i],Y[i])
                    // console.log(that.grad)
                    // dr = that.findV([Math.max(X[i],0),Math.max(Y[i],0)],that.grad);
                }
                else if (type === "amove"){
                    // dr = that.gradF(that.cp, X[i], Y[i],0.1);
                    dr = that.findV([Math.max(X[i],0),Math.max(Y[i],0)],that.grad);
                }
                else if (type === "bmove"){
                    dr = that.gradF(that.cp, X[i], Y[i],0.05);
                    // dr = that.findV([Math.max(X[i],0),Math.max(Y[i],0)],that.grad);
                }
                else if (type === "cmove"){
                    dr = that.gradF(that.cp,X[i], Y[i],0.05);
                }

                g.setLineDash([1, 0])
                g.beginPath();
                g.moveTo(that.xMap(X_new), that.yMap(Y[i])); // the start point of the path
                g.lineTo(that.xMap(X_new+dr[0]*dt), that.yMap(Y[i]+=dr[1]*dt)); // the end point
                X[i]+=dr[0]*dt
                g.lineWidth = 0.7;
                g.strokeStyle = "#FF8000";
                g.stroke(); // final draw command
                if (age[i]++ > MaxAge) {
                    // increment age of each curve, restart if MaxAge is reached
                    age[i] = randage();
                    X[i] = X0[i], Y[i] = Y0[i];
                }
            }
        }
    }

    addnodes(cp){
        let g = d3.select("#animation").node().getContext("2d");
        
        for(let i=0;i<cp.length;i++){
            let type = cp[i].slice(2);
            let arcX = this.xMap(cp[i][0]);
            let arcY = this.yMap(cp[i][1]);

            if (type.join() === "1,1"){ // maximum
                g.setLineDash([1, 0])
                g.beginPath();
                g.arc(arcX,arcY,15,0,2*Math.PI);
                g.strokeStyle = "#E24E42";
                g.lineWidth = 2;
                g.stroke();
    
                g.beginPath();
                g.arc(arcX,arcY,8,0,2*Math.PI);
                g.fillStyle = "#E24E42"
                g.fill();
                g.lineWidth = 0.7;
                g.strokeStyle = "#E24E42";
                g.stroke();
            }

            if ((type.join() === "-1,1")||(type.join() === "1,-1")) { // saddle
                g.setLineDash([1, 0])
                g.beginPath();
                g.arc(arcX,arcY,15,0,2*Math.PI);
                g.strokeStyle = "#3CC47C";
                g.stroke();
    
                g.beginPath();
                g.moveTo(arcX,arcY-8); 
                g.lineTo(arcX,arcY+8);
                g.strokeStyle = "#3CC47C";
                g.stroke();
    
                g.beginPath();
                g.moveTo(arcX-8,arcY); 
                g.lineTo(arcX+8,arcY);
                g.strokeStyle = "green";
                g.stroke();
            }

            if (type.join() === "-1,-1"){ // minimum
                g.setLineDash([1, 0])
                g.beginPath();
                g.arc(arcX,arcY,8,0,2*Math.PI);
                g.strokeStyle = "blue";
                g.stroke();
    
                g.beginPath();
                g.arc(arcX,arcY,4,0,2*Math.PI);
                g.strokeStyle = "blue";
                g.stroke();
            }
        }  
    }

    calDist(loc1, loc2){
        let dist = Math.sqrt(Math.pow(loc1[0]-loc2[0],2)+Math.pow(loc1[1]-loc2[1],2))
        return dist
    }

    findMinPt(pt0, pts){
        let dist = this.calDist(pt0,pts[0]);
        let minPt = pts[0];
        for(let i=1;i<pts.length;i++){
            let disti = this.calDist(pt0,pts[i]);
            if(disti < dist){
                dist = disti;
                minPt = pts[i]
            }
        }
        return minPt
    }

    addedges(edges){
        let g = d3.select("#animation").node().getContext("2d");
        g.beginPath();
        g.moveTo(this.xMap(0), this.yMap(0)); 
        g.lineTo(this.xMap(0), this.yMap(1));
        g.lineWidth = 6;
        g.strokeStyle = "#1E90FF";
        g.stroke();

        g.beginPath();
        g.moveTo(this.xMap(0), this.yMap(1)); 
        g.lineTo(this.xMap(1), this.yMap(1));
        g.strokeStyle = "#1E90FF";
        g.stroke();

        g.beginPath();
        g.moveTo(this.xMap(1), this.yMap(0)); 
        g.lineTo(this.xMap(1), this.yMap(1));
        g.strokeStyle = "#1E90FF";
        g.stroke();

        
        g.beginPath();
        g.moveTo(this.xMap(0), this.yMap(0)); 
        g.lineTo(this.xMap(1), this.yMap(0));
        g.strokeStyle = "#328CC1";
        g.stroke();


        g.lineWidth = 0.7;
        // let cp_new = {"max":[], "min":[], "saddle":[]};

        // for(let i=0;i<cp.length;i++){
        //     let loc = cp[i].slice(0,2);
        //     let type = cp[i].slice(2);

        //     if(type.join()==="1,1"){
        //         cp_new.max.push(loc);
        //     }
        //     else if ((type.join()==="-1,1")||(type.join()==="1,-1")){
        //         cp_new.saddle.push(loc);
        //     }
        //     else if(type.join()==="-1,-1"){
        //         cp_new.min.push(loc);
        //     }    
        // }
        for (let i=0;i<edges.length;i++){
            let bp = [this.xMap(edges[i][0][0]),this.yMap(edges[i][0][1])]; // begin point
            let ep = [this.xMap(edges[i][1][0]),this.yMap(edges[i][1][1])] // end point
            if(edges[i][2]==="max"){
                g.setLineDash([5, 5]);
                g.beginPath();
                g.moveTo(bp[0], bp[1]); 
                g.lineTo(ep[0], ep[1]);
                g.strokeStyle = "white";
                g.stroke();

            } else {g.setLineDash([1, 0]);}
            
            

        }
        // if(cp_new.saddle.length>0){
        //     for(let i=0;i<cp_new.saddle.length;i++){
        //         // draw line between saddle and max
        //         if(cp_new.max.length>0){
        //             let cp_new_max = cp_new.max.slice(0);
        //             let pts = [];
        //             if(cp_new_max.length>2){
        //                 let pt1 = this.findMinPt(cp_new.saddle[i],cp_new_max);
        //                 let idx1 = cp_new_max.indexOf(pt1);
        //                 cp_new_max.splice(idx1,1);
        //                 let pt2 = this.findMinPt(cp_new.saddle[i],cp_new_max);
        //                 pts = [pt1,pt2];
        //             } else { pts = cp_new_max; }
        //             for(let j=0;j<pts.length;j++){
        //                 let bp = [this.xMap(cp_new.saddle[i][0]),this.yMap(cp_new.saddle[i][1])]; // begin point
        //                 let ep = [this.xMap(pts[j][0]),this.yMap(pts[j][1])] // end point
        //                 g.setLineDash([5, 5])
        //                 g.beginPath();
        //                 g.moveTo(bp[0], bp[1]); 
        //                 g.lineTo(ep[0], ep[1]);
        //                 g.strokeStyle = "white";
        //                 g.stroke();
        //             }
        //         }
                // if(cp_new.min.length === 0){
                //     let pts = [[cp_new.saddle[i][0],0],[cp_new.saddle[i][0],1]];
                //     for(let j=0;j<pts.length;j++){
                //         let bp = [this.xMap(cp_new.saddle[i][0]),this.yMap(cp_new.saddle[i][1])]; // begin point
                //         let ep = [this.xMap(pts[j][0]),this.yMap(pts[j][1])] // end point
                //         g.setLineDash([1, 0])
                //         g.beginPath();
                //         g.moveTo(bp[0], bp[1]); 
                //         g.lineTo(ep[0], ep[1]);
                //         g.strokeStyle = "white";
                //         g.stroke();
                //     }

                // }
        //         if(cp_new.min.length>0){
        //             for(let j=0;j<cp_new.min.length;j++){
        //                 let bp = [this.xMap(cp_new.saddle[i][0]),this.yMap(cp_new.saddle[i][1])]; // begin point
        //                 let ep = [this.xMap(cp_new.min[j][0]),this.yMap(cp_new.min[j][1])] // end point
        //                 g.setLineDash([1, 0])
        //                 g.beginPath();
        //                 g.moveTo(bp[0], bp[1]); 
        //                 g.lineTo(ep[0], ep[1]);
        //                 g.strokeStyle = "white";
        //                 g.stroke();
        //             }
        //         }
        //     }
        // }

    }

    findEdges(cp){
        let cp_new = {"max":[], "min":[], "saddle":[]};
        for(let i=0;i<cp.length;i++){
            let loc = cp[i].slice(0,2);
            let type = cp[i].slice(2);

            if(type.join()==="1,1"){
                cp_new.max.push(loc);
            }
            else if ((type.join()==="-1,1")||(type.join()==="1,-1")){
                cp_new.saddle.push(loc);
            }
            else if(type.join()==="-1,-1"){
                cp_new.min.push(loc);
            }    
        }
        let edges = [];
        if(cp_new.saddle.length>0){
            for(let i=0;i<cp_new.saddle.length;i++){
                // draw line between saddle and max
                if(cp_new.max.length>0){
                    let cp_new_max = cp_new.max.slice(0);
                    let pts = [];
                    if(cp_new_max.length>2){
                        let pt1 = this.findMinPt(cp_new.saddle[i],cp_new_max);
                        let idx1 = cp_new_max.indexOf(pt1);
                        cp_new_max.splice(idx1,1);
                        let pt2 = this.findMinPt(cp_new.saddle[i],cp_new_max);
                        pts = [pt1,pt2];
                    } else { pts = cp_new_max; }
                    for(let j=0;j<pts.length;j++){
                        edges.push([cp_new.saddle[i],pts[j],"max"])
                    }
                }
                // draw line between saddle and min
                if(cp_new.min.length === 0){
                    let pts = [[cp_new.saddle[i][0],0],[cp_new.saddle[i][0],1]];
                    for(let j=0;j<pts.length;j++){
                        edges.push([cp_new.saddle[i],pts[j],"min"]);
                    }
                }
                if(cp_new.min.length>0){
                    let cp_new_min = cp_new.min.slice(0);
                    let pts = [];
                    if(cp_new_min.length>2){
                        let pt1 = this.findMinPt(cp_new.saddle[i],cp_new_min);
                        let idx1 = cp_new_min.indexOf(pt1);
                        cp_new_min.splice(idx1,1);
                        let pt2 = this.findMinPt(cp_new.saddle[i],cp_new_min);
                        pts = [pt1,pt2];
                    } else { pts = cp_new_min; }
                    for(let j=0;j<pts.length;j++){
                        edges.push([cp_new.saddle[i],pts[j],"min"]);
                    }
                }
            }
        }
        return edges;
    }

    findLocations(cp,sigma){        
        let that = this;
        let xyLoc = [];
        let cp_local = [];
        // let xLoc = [];
        // console.log(JSON.stringify(xyLoc).indexOf(JSON.stringify([-1,1])))
        // this.xp.forEach(x=>xGrad.push(that.gradF(cp, x,0.5,sigma)[0]))
        // this.yp.forEach(y=>yGrad.push(that.gradF(cp, 0.5,y,sigma)[0]))
        for(let i=1;i<this.xp.length-1;i++){
            for(let j=1;j<this.yp.length-1;j++){ // no boundary point will be considered (boundary is the minimum)
                let point = [this.xp[i],this.yp[j]]
                let point_10 =  [this.xp[i-1],this.yp[j]]
                let point0_1 = [this.xp[i],this.yp[j-1]]
                let point10 = [this.xp[i+1],this.yp[j]]
                let point01 = [this.xp[i],this.yp[j+1]]
                let g0 = this.gradF(cp, point[0], point[1], sigma)
                let g_10 = this.gradF(cp, point_10[0], point_10[1], sigma)
                let g0_1 = this.gradF(cp, point0_1[0], point0_1[1], sigma)
                let g10 = this.gradF(cp, point10[0], point10[1], sigma)
                let g01 = this.gradF(cp, point01[0], point01[1], sigma)
                if((Math.abs(g0[0])-Math.abs(g_10[0])<=0)&&(Math.abs(g0[1])-Math.abs(g0_1[1])<=0)&&(Math.abs(g0[0])-Math.abs(g10[0])<=0)&&(Math.abs(g0[1])-Math.abs(g01[1])<=0)){ // a critical point is where the gradiant is local minimum
                    let f0 = this.F(cp, point[0], point[1], sigma)
                    let f_10 = this.F(cp, point_10[0], point_10[1], sigma)
                    let f0_1 = this.F(cp, point0_1[0], point0_1[1], sigma)
                    let f10 = this.F(cp, point10[0], point10[1], sigma)
                    let f01 = this.F(cp, point01[0], point01[1], sigma)
                    // console.log(f0,f_10,f0_1,f10,f01)
                    
                    if((f0[0]>=f_10[0])&&(f0[1]>=f0_1[1])&&(f0[0]>=f10[0])&&(f0[1]>=f01[1])){
                        
                        cp_local.push([this.xp[i],this.yp[j],1,1])
                    }
                    else if((f0[0]<=f_10[0])&&(f0[1]<=f0_1[1])&&(f0[0]<=f10[0])&&(f0[1]<=f01[1])){
                        cp_local.push([this.xp[i],this.yp[j],-1,-1])
                    }
                    else if((f0[0]<=f_10[0])&&(f0[1]>=f0_1[1])&&(f0[0]<=f10[0])&&(f0[1]>=f01[1])){
                        cp_local.push([this.xp[i],this.yp[j],-1,1])
                    }
                    else if((f0[0]>=f_10[0])&&(f0[1]<=f0_1[1])&&(f0[0]>=f10[0])&&(f0[1]<=f01[1])){
                        cp_local.push([this.xp[i],this.yp[j],1,-1])
                    }
                    
                    // console.log(point, point_10, point0_1, point10, point01)
                    // console.log(g0,g_10,g0_1,g10,g01)
                    // cp_max.push(point)
                }

            }
        }
        let cp_local_new = [];
        cp_local.forEach(e=>cp_local_new.push([e[0], e[1], e[2],e[3]]))
        // console.log(this.xMap(cp_max[0][0]),this.yMap(cp_max[0][1]))
        return cp_local_new
    }

    clearCanvas(){  
        // $('#animation').remove();
        // $('#canvas-container').append('<canvas id="animation" width="1000" height="600"></canvas>');
    }  
}