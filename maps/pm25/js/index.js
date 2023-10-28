
async function load_data(path) {
    let res = await fetch(path)
    let map = await res.json()
    return map
}

const handle_select = ({name, selected}) => {
    let k;
    for(k in selected) {
        if (k !== name & selected[k] === true) break
    }
    myChart.dispatchAction({
        type: 'legendUnSelect',
        name: k
    })
    const option = myChart.getOption()
    const current_data = option.series.find(obj => obj.name === name);
    const values = current_data.data.map(item => item.value)

    myChart.setOption({
        visualMap: {
            min: Math.min(...values),
            max: Math.max(...values),
        }
    });
}


const set_value = (value) => {
    if(value !== null && value !== undefined) return value.toFixed(4)
}


// 主循环
async function main() {
    const mongo = await load_data("/static/150000_full.json")

    // 基于准备好的dom，初始化echarts实例
    
    echarts.registerMap('内蒙古', mongo);
    

    // 指定图表的配置项和数据
    var option = {
    animation: true,
    title: {
        text: 'Spatial distribution of PM2.5 components'
    },
    legend: {
        // Try 'horizontal'
        orient: 'vertical',
        left: 0,
        top: 50
    },
    tooltip: {
        trigger: 'item',
        valueFormatter: (value) => value.toFixed(4),
        formatter: (params) => {
            return `${set_value(params.data.value)} μg/m<sup>3</sup>`
        }
    },
    toolbox: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          dataView: { readOnly: false },
          restore: {},
          saveAsImage: {}
        }
    },
    visualMap: {
        min: 0,
        max: 1,
        text: ['Concentration'],
        realtime: true,
        calculable: true,
        precision: 4,
        inRange: {
            color: ['lightskyblue', 'yellow', 'orangered']
        //  color: ['lightskyblue', 'orangered']
        //   color: ['lightskyblue', 'darkblue']
        }
      },
    series: [...(await load_data("/static/map_air.json"))]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.hideLoading();

    

    myChart.setOption(option);
    myChart.dispatchAction({
        type: 'legendInverseSelect'
    })
    myChart.dispatchAction({
        type: 'legendSelect',
        name: option.series[0].name
    })
    const values = option.series[0].data.map(item => item.value)
    // const bound = Math.max(...values.map(Math.abs))
    myChart.setOption({
        visualMap: {
            min: Math.min(...values),
            max: Math.max(...values),
        }
    });
}

var myChart = echarts.init(document.getElementById('main'));
myChart.on('legendselectchanged', handle_select)
// 监听窗口大小变化
window.addEventListener('resize', function() {
    myChart.resize(); // 调整图表大小
  });
myChart.showLoading();
main()
