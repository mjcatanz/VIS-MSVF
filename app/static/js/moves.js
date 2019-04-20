class moves{
    constructor(anim, sliders, persistence){
        this.anim = anim;
        this.sliders = sliders;
        this.persistence = persistence;

        this.apType = "";
        this.amType = "";
        this.bpType = "";
        this.bmType = "";
        this.dpType = "";
        this.dmType = "";
        this.cpMax = [];
        for(let i=0;i<this.anim.cp.length;i++){
            if(this.anim.cp[i].type==="max"){
                this.cpMax.push(this.anim.cp[i]);
            }
        }

    }

    amovePlus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = this.anim.xMapReverse(d3.event.x-80);
                let y = this.anim.yMapReverse(d3.event.y-100+7.5);
                let mincp = this.anim.findMinPt({"x":x,"y":y},this.cpMax);
                if(this.apType === "max"){
                    let id = this.anim.cp.length;
                    let pt_max = new criticalPoint(id,x,y,"max");
                    this.cpMax.push(pt_max);
                    this.anim.cp.push(pt_max);
                    this.anim.cp_max.push(pt_max);
                    let pt_saddle = new criticalPoint(id+1,(x+mincp.x)/2,(y+mincp.y)/2,"saddle");
                    this.anim.cp.push(pt_saddle);
                    this.anim.cp_saddle.push(pt_saddle);
                    if(d3.select("#ifskeleton").node().value === "Only Display Skeleton"){
                        this.anim.drawFlag=true;
                    }
                    d3.select("#amoveplus")
                        .attr("value","Face-max move")
                    this.apType="";
                    this.anim.edges.push([pt_saddle,pt_saddle,{"x":pt_saddle.x-0.04,"y":pt_saddle.y+0.04},"max","temp1"]);
                    this.anim.edges.push([pt_saddle,pt_saddle,{"x":pt_saddle.x+0.04,"y":pt_saddle.y-0.04},"max","temp2"]);
                    this.anim.edges.push([pt_saddle,pt_saddle,{"x":pt_saddle.x-0.04,"y":pt_saddle.y-0.04},"min","temp3"]);
                    this.anim.edges.push([pt_saddle,pt_saddle,{"x":pt_saddle.x+0.04,"y":pt_saddle.y+0.04},"min","temp4"]);
                }
                this.anim.drawAnnotation();
                this.anim.addedges();
                this.sliders.addSlider();
                this.anim.findNearestPoint();
                this.anim.findRange();
            })
    }

    amoveMinus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = this.anim.xMapReverse(d3.event.x-80);
                let y = this.anim.yMapReverse(d3.event.y-100+7.5);
                // **** Maybe there is no need to find the minpt?
                let mincp = this.anim.findMinPt({"x":x,"y":y},this.anim.cp);
                if(this.amType === "min"){
                    let id = this.anim.cp.length;
                    let pt_saddle = new criticalPoint(id,x,y,"saddle");
                    this.anim.cp.push(pt_saddle);
                    this.anim.cp_saddle.push(pt_saddle);
                    let pt_min = new criticalPoint(id+1,(x+mincp.x)/2,(y+mincp.y)/2,"min");
                    this.anim.cp.push(pt_min)
                    this.anim.cp_min.push(pt_min);

                    // let pt_min = new criticalPoint(id,x,y,"min");
                    // this.anim.cp.push(pt_min)
                    // this.anim.cp_min.push(pt_min);
                    // let pt_saddle = new criticalPoint(id+1,(x+mincp.x)/2,(y+mincp.y)/2,"saddle");
                    // this.anim.cp.push(pt_saddle);
                    // this.anim.cp_saddle.push(pt_saddle);
                    if(d3.select("#ifskeleton").node().value === "Only Display Skeleton"){
                        this.anim.drawFlag=true;
                    }
                    d3.select("#amoveminus")
                        .attr("value","Face-min move")
                    this.amType="";
                    this.anim.edges.push([pt_saddle,pt_saddle,{"x":pt_saddle.x-0.04,"y":pt_saddle.y+0.04},"max","temp1"]);
                    this.anim.edges.push([pt_saddle,pt_saddle,{"x":pt_saddle.x+0.04,"y":pt_saddle.y-0.04},"max","temp2"]);
                    this.anim.edges.push([pt_saddle,pt_saddle,{"x":pt_saddle.x-0.04,"y":pt_saddle.y-0.04},"min","temp3"]);
                    this.anim.edges.push([pt_saddle,pt_saddle,{"x":pt_saddle.x+0.04,"y":pt_saddle.y+0.04},"min","temp4"]);
                    
                    // this.anim.edges = this.anim.findEdges(this.anim.cp);
                    // for(let i=0;i<this.anim.edges.length;i++){
                    //     if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
                    //         this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
                    //     }
                    // }
                    // this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
                    // this.anim.grad = this.anim.constructMesh(this.anim.sigma);
                }
                this.anim.drawAnnotation();
                this.anim.addedges();
                this.sliders.addSlider();
                this.anim.findNearestPoint();
                this.anim.findRange();
            })
    }

    bmovePlus(){
        d3.select("#edgegroup").selectAll("path")
            .on("click", (d)=>{
                if(d[3]==="max"){
                    let x = d[1].x;
                    let y = d[1].y;
                    if(this.bpType === "max"){
                        let id = this.anim.cp.length;
                        this.anim.cp.push(new criticalPoint(id,x,y,"max"))
                        this.anim.cp.push(new criticalPoint(id+1,(x+d[2].x)/2,(y+d[2].y)/2,"saddle"))
                        if(d3.select("#ifskeleton").node().value === "Only Display Skeleton"){
                            this.anim.drawFlag=true;
                        }
                        d3.select("#bmoveplus")
                            .attr("value","Edge-max move")
                        this.bpType="";
                        this.anim.edges = this.anim.findEdges(this.anim.cp);
                        for(let i=0;i<this.anim.edges.length;i++){
                            if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
                                this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
                            }
                        }
                        // this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
                        this.anim.grad = this.anim.constructMesh(this.anim.sigma);
                    }
                    this.anim.drawAnnotation();
                    this.anim.addedges();
                    this.sliders.addSlider();
                    this.anim.findNearestPoint();
                    this.anim.findRange();
                }
            })
    }

    bmoveMinus(){
        d3.select("#edgegroup").selectAll("path")
            .on("click",(d)=>{
                if(d[3]==="min"){
                    let x = d[1].x;
                    let y = d[1].y;
                    if(this.bmType === "min"){
                        let id = this.anim.cp.length;
                        this.anim.cp.push(new criticalPoint(id,x,y,"min"))
                        this.anim.cp.push(new criticalPoint(id+1,(x+d[2].x)/2,(y+d[2].y)/2,"saddle"))
                        if(d3.select("#ifskeleton").node().value === "Only Display Skeleton"){
                            this.anim.drawFlag=true;
                        }
                        d3.select("#bmoveminus")
                            .attr("value","Edge-min move")
                        this.bmType="";
                        this.anim.edges = this.anim.findEdges(this.anim.cp);
                        for(let i=0;i<this.anim.edges.length;i++){
                            if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
                                this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
                            }
                        }
                        // this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
                        this.anim.grad = this.anim.constructMesh(this.anim.sigma);
                    }
                    this.anim.drawAnnotation();
                    this.anim.addedges();
                    this.sliders.addSlider();
                    this.anim.findNearestPoint();
                    this.anim.findRange();
                }
            })
    }
        
    dmovePlus(){
        d3.select("#pointgroup").selectAll("text")
            .on("click",(d)=>{
                //****  need to check whether it is a max point !!****
                if(this.dpType="add"){
                    let x=d.x;
                    let y=d.y
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"saddle"))
                    this.anim.cp.push(new criticalPoint(id+1,x+0.05,y-0.05,"max"))
                    d.x = d.x - 0.05;
                    d.y = d.y + 0.05;
                    if(d3.select("#ifskeleton").node().value === "Only Display Skeleton"){
                        this.anim.drawFlag=true;
                    }                    
                    this.dpType=""
                    this.anim.edges = this.anim.findEdges(this.anim.cp);
                    d3.select("#dmoveplus")
                        .attr("value","Vertex-max Move");
                }
                for(let i=0;i<this.anim.edges.length;i++){
                    if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
                        this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
                    }
                }
                // this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
                this.anim.grad = this.anim.constructMesh(this.anim.sigma);
                this.anim.drawAnnotation();
                this.anim.addedges();
                this.sliders.addSlider();
                this.anim.findNearestPoint();
                this.anim.findRange();
            })
    }
    dmoveMinus(){
        d3.select("#pointgroup").selectAll("text")
            .on("click",(d)=>{
                if(this.dmType="add"){
                    //****  need to check whether it is a min point !!****
                    let x = d.x;
                    let y = d.y;
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"saddle"))
                    this.anim.cp.push(new criticalPoint(id+1,x+0.05,y-0.05,"min"))
                    d.x = d.x - 0.05;
                    d.y = d.y + 0.05;
                    if(d3.select("#ifskeleton").node().value === "Only Display Skeleton"){
                        this.anim.drawFlag=true;
                    }                    
                    this.dmType=""
                    this.anim.edges = this.anim.findEdges(this.anim.cp);
                    d3.select("#dmoveminus")
                        .attr("value","Vertex-min Move");
                }
                for(let i=0;i<this.anim.edges.length;i++){
                    if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
                        this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
                    }
                }
                // this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
                this.anim.grad = this.anim.constructMesh(this.anim.sigma);
                this.anim.drawAnnotation();
                this.anim.addedges();
                this.sliders.addSlider();
                this.anim.findNearestPoint();
                this.anim.findRange();
            })
    }
    // dmoveEvenPlus(){
    //     d3.select("#annotation")
    //         .on("click",()=>{
    //             if(this.dpeType="add"){
    //                 //****  need to check whether it is a min point !!****
    //                 let x = this.anim.xMapReverse(d3.event.x-80);
    //                 let y = this.anim.yMapReverse(d3.event.y-30+7.5);
    //                 let cp = this.anim.findMinPt({"x":x,"y":y},this.anim.cp)
    //                 let id = this.anim.cp.length;
    //                 this.anim.cp.push(new criticalPoint(id,cp.x,cp.y,"max"))
    //                 this.anim.cp.push(new criticalPoint(id+1,cp.x+0.05,cp.y-0.05,"saddle"))
    //                 this.anim.cp[cp.id].x = cp.x - 0.05;
    //                 this.anim.cp[cp.id].y = cp.y + 0.05;
    //                 if(d3.select("#ifskeleton").node().value === "Only Display Skeleton"){
    //                     this.anim.drawFlag=true;
    //                 }                    
    //                 // d3.select("#annotation")
    //                 //     .on("click", ()=>{this.anim.drawFlag = (this.anim.drawFlag) ? false : true;});
    //                 this.dpeType=""
    //                 this.anim.edges = this.anim.findEdges(this.anim.cp);
    //                 d3.select("#dmoveevenplus")
    //                     .attr("value","Vertex-max Move");


    //             }
    //             for(let i=0;i<this.anim.edges.length;i++){
    //                 if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
    //                     this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
    //                 }
    //             }
    //             this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
    //             this.anim.grad = this.anim.constructMesh(this.anim.sigma);
    //             this.anim.drawAnnotation();
    //             this.anim.addedges();
    //             this.sliders.addSlider();
    //             this.anim.findNearestPoint();
    //             this.anim.findRange();

                
    //             // console.log(cp)
    //         })
    // }

    // dmoveEvenMinus(){
    //     d3.select("#annotation")
    //         .on("click",()=>{
    //             if(this.dmeType="add"){
    //                 //****  need to check whether it is a min point !!****
    //                 let x = this.anim.xMapReverse(d3.event.x-80);
    //                 let y = this.anim.yMapReverse(d3.event.y-30+7.5);
    //                 let cp = this.anim.findMinPt({"x":x,"y":y},this.anim.cp)
    //                 let id = this.anim.cp.length;
    //                 this.anim.cp.push(new criticalPoint(id,cp.x,cp.y,"min"))
    //                 this.anim.cp.push(new criticalPoint(id+1,cp.x+0.05,cp.y-0.05,"saddle"))
    //                 this.anim.cp[cp.id].x = cp.x - 0.05;
    //                 this.anim.cp[cp.id].y = cp.y + 0.05;
    //                 if(d3.select("#ifskeleton").node().value === "Only Display Skeleton"){
    //                     this.anim.drawFlag=true;
    //                 }                    
    //                 // d3.select("#annotation")
    //                 //     .on("click", ()=>{this.anim.drawFlag = (this.anim.drawFlag) ? false : true;});
    //                 this.dmeType=""
    //                 this.anim.edges = this.anim.findEdges(this.anim.cp);
    //                 d3.select("#dmoveevenminus")
    //                     .attr("value","Vertex-min Move");


    //             }
    //             for(let i=0;i<this.anim.edges.length;i++){
    //                 if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
    //                     this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
    //                 }
    //             }
    //             this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
    //             this.anim.grad = this.anim.constructMesh(this.anim.sigma);
    //             this.anim.drawAnnotation();
    //             this.anim.addedges();
    //             this.sliders.addSlider();
    //             this.anim.findNearestPoint();
    //             this.anim.findRange();

                
    //             // console.log(cp)
    //         })
    // }
}