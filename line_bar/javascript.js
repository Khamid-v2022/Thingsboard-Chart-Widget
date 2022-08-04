var seriesMarkLine = {} 
var myChart; 
var option; 
var serverAttributes = []; 
var clientAttributes = [];  
self.onInit = function() {     
    var settings = self.ctx.settings;     
    
    if (self.ctx.settings.annotations !== undefined) {         
        var clientAttributesToPoll = []         
        var serverAttributesToPoll = []         
        var clientAttributesCounter = 0;         
        var serverAttributesCounter = 0;          
        
        for (var i = 0; i < self.ctx.settings.annotations.length; i++) { 
            if ((self.ctx.settings.annotations[i].attributeType == 'Client') && (self.ctx.settings.annotations[i].annotationsType == 'Attribute')) {     
                if (clientAttributesCounter > 0)         
                    clientAttributesToPoll = clientAttributesToPoll + ',';
                clientAttributesToPoll.push(self.ctx.settings.annotations[i].attribute);     
                clientAttributesCounter++;
            } 
            
            if ((self.ctx.settings.annotations[i].attributeType == 'Server') && (self.ctx.settings.annotations[i].annotationsType == 'Attribute')) {       
                if (serverAttributesCounter > 0)         
                    serverAttributesToPoll = serverAttributesToPoll + ',';
                    
                serverAttributesToPoll.push(self.ctx.settings.annotations[i].attribute);     
                serverAttributesCounter++;
            }          
        }     
    }           
    
    if (clientAttributesToPoll !== '') {         
        var entityId = self.ctx.datasources[0].entityId;         
        var entity = { 
            entityType: 'DEVICE', 
            id: entityId         
        } 

        self.ctx.attributeService.getEntityAttributes(
            entity, 
            'CLIENT_SCOPE',
            clientAttributesToPoll).subscribe((attributes) => {  
                //Add Annotations that has been defined as ClientAttributes 
                annotiatons = []; 
                for (var i = 0; i < attributes.length; i++) {
                        
                    for (var j = 0; j < self.ctx.settings.annotations.length; j++){         
                        if (self.ctx.settings.annotations[j].attribute == attributes[i].key) {     
                            clientAttributes.push({
                                'key': attributes[i].key, 
                                'value': parseFloat(attributes[i].value),
                                'color': self.ctx.settings.annotations[j].color,
                                'axisAssignment': self.ctx.settings.annotations[j].axisAssignment
                            });
                        }  
                    }     
                }    
            })     
    }     

    if (serverAttributesToPoll !== '') {          
        entityId = self.ctx.datasources[0].entityId;         
        entity = { entityType: 'DEVICE', id: entityId };         
        self.ctx.attributeService.getEntityAttributes(entity, 'SERVER_SCOPE', serverAttributesToPoll).subscribe((attributes) => {  
            //Add Annotations that has been defined as ClientAttributes 
            annotiatons = [];  
            for (var i = 0; i < attributes.length; i++) {           
                for (var j = 0; j < self.ctx.settings.annotations.length; j++) {         
                    if (self.ctx.settings.annotations[j].attribute ==  attributes[i].key) {                
                        serverAttributes.push( { 
                            'key': attributes[i].key,         
                            'value': parseFloat(attributes[i].value),         
                            'color': self.ctx.settings.annotations[j].color,     
                            'axisAssignment': self.ctx.settings.annotations[j].axisAssignment     
                        });          
                    }              
                } 
            }         
        }) 
    }        
    self.onResize();   
}      

self.onDataUpdated = function() {      
    //self.onResize();     
    var series = Array();     
    for (var i = 0; i < self.ctx.data.length; i++) { 
        let seriesMarkLine = { data: [] }         
        var settings = self.ctx.data[i].dataKey.settings;         
        let legendElement = self.ctx.data[i].dataKey.label         
        //legend.push(legendElement);           
        let dataElement = Array();         
        var datasourceData = self.ctx.data[i];         
        var dataSet = datasourceData.data;         
        var dataToAdd = Array();         
        
        for (var d = 0; d < dataSet.length; d++) { 
            var tsValuePair = dataSet[d]; 
            var ts = tsValuePair[0]; 
            var value = tsValuePair[1];  
            dataElement.push([ts, value.toFixed(settings.numberOfDigits || 1)]);         
        }         
        
        dataToAdd.push(dataElement);            
        
        var seriesMarkLineData = { type: 'average', name: 'Average'}         
        
        if (settings.showAverage) 
            seriesMarkLine.data.push(seriesMarkLineData)          
        
        if (self.ctx.settings.annotations != undefined) {} 
        
        var markPoint = { data: [] }        
        
        if (settings.showMinValue) 
            markPoint.data.push({ type: 'min', name: 'min' })         
        
        if (settings.showMaxValue) 
            markPoint.data.push({     type: 'max',     name: 'max' })            
        let seriesElement = { 
            name: legendElement, 
            itemStyle: { 
                normal: { color: self.ctx.data[i].dataKey.color } 
            }, 
            type: (settings.chartType == 'Bar') ? 'bar' : 'line', 
            yAxisIndex: (settings.axisAssignment == 'Right') ? 1 : 0, 
            data: dataElement, 
            symbol: (self.ctx.settings.showDataPoints) ? 'circle' : 'none', 
            markLine: seriesMarkLine, markPoint: markPoint,           
        }          
        
        if (settings.fillChart) { 
            let color1 = settings.gradientColor1 || '#0366fc'  
            let color2 = settings.gradientColor2 || '#a7c5f2' 
            seriesElement.areaStyle = {     
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {     
                        offset: 0,     
                        color: adjustHexOpacity(color1, settings.fillOpacity)             
                    },             
                    {     
                        offset: 1,     
                        color: adjustHexOpacity(color2, settings.fillOpacity)             
                    }         
                ]) 
            }         
        }         
        series.push(seriesElement)     
    }          
    
    // Add Fixed Annotations     
    
    if (self.ctx.settings.annotations != undefined) {  
        for (var j = 0; j < self.ctx.settings.annotations.length; j++) {     
            var color = self.ctx.settings.annotations[j].color || 'blue';          
            let seriesMarkLineData1 = {         
                yAxis: self.ctx.settings.annotations[j].fixedNumber,         
                name: self.ctx.settings.annotations[j].description,         
                lineStyle: { type: 'solid',  color: color, width: 2 },         
                label:{ position: 'middle', formatter: '{b}: {c}' }      
            }         
            
            if (self.ctx.settings.annotations[j].description == undefined)             
                seriesMarkLineData1.label.formatter = '{c}'          
            
            for (var i = 0; i < self.ctx.data.length; i++) {          
                if (self.ctx.settings.annotations[j].annotationsType == 'Fixed'){     
                    
                    if ((self.ctx.settings.annotations[j].axisAssignment == 'Right') && (series[i].yAxisIndex == 1)) {      
                        series[i].markLine.data.push(seriesMarkLineData1)      
                        break;     
                    }     
                    
                    if ((self.ctx.settings.annotations[j].axisAssignment == 'Left') && (series[i].yAxisIndex == 0))     {           
                        series[i].markLine.data.push(seriesMarkLineData1)     
                        break;     
                    }      
                } 
            } 
        }           
    }        
    
    // Add Server Atttribute Annotations     
    if (self.ctx.settings.annotations != undefined) {  
        for (var j = 0; j < serverAttributes.length; j++) {           
            let seriesMarkLineData1 = {         
                yAxis: serverAttributes[j].value,         
                name: serverAttributes[j].key,         
                lineStyle: {             
                    type: 'solid',  
                    color: serverAttributes[j].color,             
                    width: 2      
                },         
                label:{             
                    position: 'middle',             
                    formatter: '{b}: {c}'         
                }      
            }    
            
            for (var i = 0; i < self.ctx.data.length; i++) {       
                if ((serverAttributes[j].axisAssignment == 'Right') && (series[i].yAxisIndex == 1)) {      
                    series[i].markLine.data.push(seriesMarkLineData1)      
                    break;     
                }     
                
                if ((serverAttributes[j].axisAssignment == 'Left') && (series[i].yAxisIndex == 0)) {           
                    series[i].markLine.data.push(seriesMarkLineData1)     
                    break;     
                }       
            } 
        }           
    }   
    
    // Add Client Atttribute Annotations     
    if (self.ctx.settings.annotations != undefined) {  
        for (var j = 0; j < clientAttributes.length; j++) {           
            let seriesMarkLineData1 = {        
                 yAxis: clientAttributes[j].value,         
                 name: clientAttributes[j].key,         
                 lineStyle: {             
                    type: 'solid',  
                    color: clientAttributes[j].color,             
                    width: 2      
                },         
                label:{             
                    position: 'middle',             
                    formatter: '{b}: {c}'         
                }      
            }    
            
            for (var i = 0; i < self.ctx.data.length; i++) {           
                if ((clientAttributes[j].axisAssignment == 'Right') && (series[i].yAxisIndex == 1)) {      
                    series[i].markLine.data.push(seriesMarkLineData1)      
                    break;     
                }     
                
                if ((clientAttributes[j].axisAssignment == 'Left') && (series[i].yAxisIndex == 0)) {           
                    series[i].markLine.data.push(seriesMarkLineData1)          
                    break;     
                }       
            } 
        }           
    }          
    
    if (myChart != undefined) {     
        option.series = series;     
        myChart.setOption(option);     
    }       
}  

self.onResize = function() {      
    $('#echart', self.ctx.$container)[0].style.height =  self.ctx.height + 'px';     
    $('#echart', self.ctx.$container)[0].style.width = ( self.ctx.width - 15) + 'px';     
    $('#echart', self.ctx.$container)[0].style.paddingLeft = (5) + 'px';      
    draw();     
    self.onDataUpdated(); 
}  

self.onEditModeChanged = function() {  }  

self.onMobileModeChanged = function() {  }  
self.getSettingsSchema = function() {  }  
self.getDataKeySettingsSchema = function() {  }  
self.onDestroy = function() {  }



function adjustHexOpacity(color, opacity) {      
    const r = parseInt(color.slice(1, 3), 16);         
    const g = parseInt(color.slice(3, 5), 16);         
    const b = parseInt(color.slice(5, 7), 16);          
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';     
}  
    
function draw() {      
    let seriesMarkLine = { data: [] };      
    myChart = echarts.init($('#echart', self.ctx.$container)[0]);       
    var legend = Array();     
    var series = Array();       
    for (var i = 0; i < self.ctx.data.length; i++) {         
        var settings = self.ctx.data[i].dataKey.settings;         
        let legendElement = self.ctx.data[i].dataKey.label         
        //legend.push(legendElement);           
        let dataElement = Array();         
        var datasourceData = self.ctx.data[i];         
        var dataSet = datasourceData.data;         
        var dataToAdd = Array();         
        
        for (var d = 0; d < dataSet.length; d++) { 
            var tsValuePair = dataSet[d]; 
            var ts = tsValuePair[0]; 
            var value = tsValuePair[1];  
            dataElement.push([ts, value.toFixed(settings.numberOfDigits || 1)]);        
        }         
        
        dataToAdd.push(dataElement);            
        let seriesMarkLineData = { 
            type: 'average', 
            name: 'Average'         
        }         
        
        if (settings.showAverage) 
            seriesMarkLine.data.push(seriesMarkLineData)           
        
            var markPoint = { 
            data: []         
        }         
        
        if (settings.showMinValue) 
            markPoint.data.push({     
                type: 'min',     
                name: 'min' 
            })         
        if (settings.showMaxValue) 
            markPoint.data.push({     
                type: 'max',     
                name: 'max' 
            })            
        let seriesElement = { 
            name: legendElement, 
            itemStyle: {     
                normal: {         
                    color: self.ctx.data[i].dataKey.color     
                } 
            }, 
            type: (settings.chartType == 'Bar') ? 'bar' : 'line', 
            yAxisIndex: (settings.axisAssignment == 'Right') ? 1 : 0, 
            data: dataElement, 
            symbol: (self.ctx.settings.showDataPoints) ? 'circle' : 'none', 
            markLine: seriesMarkLine, 
            markPoint: markPoint,           
        }         
        
        if (settings.fillChart) {  
            let color1 = settings.gradientColor1 || '#0366fc';  
            let color2 = settings.gradientColor2 || '#a7c5f2';
            seriesElement.areaStyle = {     
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {     
                        offset: 0,     
                        color: adjustHexOpacity(color1, settings.fillOpacity)             
                    },             
                    {     
                        offset: 1,     
                        color: adjustHexOpacity(color2, settings.fillOpacity)             
                    } 
                ])
            };         
        }            
        
        series.push(seriesElement);         
    }  
    
    option = {         
        tooltip: {  
            trigger: 'axis', 
            axisPointer: {     
                type: 'cross',     
                crossStyle: { color: '#999' } 
            }         
        },         
        toolbox: {  
            feature: {     
                dataView: {         
                    show: true,         
                    readOnly: false     
                },     
                //magicType: {show: true, type: ['line', 'bar']},     
                //restore: {show: true},     
                saveAsImage: { show: true },     
                dataZoom: { yAxisIndex: 'none' },    
                restore: {} 
            }         
        },         
        legend: { data: legend },         
        xAxis: [{ 
            type: 'time', 
            axisLabel: { hideOverlap: true }  
            //axisPointer: { 
            //    type: 'shadow' 
            //}         
        }],         
        dataZoom: [{ 
            type: 'inside', 
            throttle: 50        
         }],         
        yAxis: [
            {     
                type: 'value',     
                name: self.ctx.settings.yAxisLeftTitle || '',      
                //interval: 50,     
                axisLabel: { formatter: '{value} ' + (self.ctx.settings.yAxisLeftUnit || 'ml') } 
            }, 
            {     
                type: 'value',     
                name: self.ctx.settings.yAxisRightTitle || '',      
                //interval: 5,     
                axisLabel: { formatter: '{value} ' + (self.ctx.settings.yAxisRightUnit || 'ml') } 
            }         
        ],         
        series: series     
    };         
    
    if (self.ctx.settings.showPanZoomTool){          
        option.dataZoom.push({start: 0, stop: 100 })           
    }      
    
    if (!self.ctx.settings.yAxisLeftAutoScale) {          
        option.yAxis[0].min = self.ctx.settings.yAxisLeftMinScale || 0, 
        option.yAxis[0].max = self.ctx.settings .yAxisLeftMaxScale || 100     
    }     
    if (!self.ctx.settings.yAxisRightAutoScale) {          
        option.yAxis[1].min = self.ctx.settings.yAxisRightMinScale || 0, 
        option.yAxis[1].max = self.ctx.settings .yAxisRightMaxScale || 100     
    }      
    
    myChart.setOption(option);     
    myChart.resize();       
}  