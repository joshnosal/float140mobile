import React, { Component } from 'react'
import axios from 'axios'
import async from 'async'

import Chart from './CryptoChart'

export default class CryptoHoc extends Component {
  constructor(props){
    super(props)
    this.state = {
      data: [],
      tokenSource: axios.CancelToken.source()
    }
  }

  getData = () => {
    async.waterfall([
      (done)=>{
        let date = new Date(),
            granularity,
            start,
            end = date.getTime()

        if (this.props.period === '24h') {
          start = date.getTime() - (1000 * 60 * 60 * 24)
          granularity = 900
        } else if (this.props.period === '7d') {
          start = date.getTime() - (1000 * 60 * 60 * 24 * 7)
          granularity = 3600
        } else if (this.props.period === '30d') {
          start = date.getTime() - (1000 * 60 * 60 * 24 * 30)
          granularity = 3600
        } else if (this.props.period === '1y') {
          start = date.getTime() - (1000 * 60 * 60 * 24 * 365)
          granularity = 86400
        } else if (this.props.period === '5y') {
          start = date.getTime() - (1000 * 60 * 60 * 24 * 365 * 5)
          granularity = 86400
        } else {
          start = date.getTime() - (1000 * 60 * 60)
          granularity = 60
        }
        done(null, start, end, granularity)
      },
      (start, end, granularity, done) => {
        let finished = false, int = 0, array=[]
        async.whilst(
          (cb)=>{cb(null, !finished)},
          (next)=>{
            int = end > start + granularity * 1000 * 298 ? start + granularity * 1000 * 298 : end
            axios.get('https://api.pro.coinbase.com/products/'+this.props.details.product+'/candles', {
              header: {
                'Content-Type': 'application/json'
              },
              params: {
                start: new Date(start).toISOString(),
                end: new Date(int).toISOString(),
                granularity: granularity
              }
            }).then(res=>{
              array = array.concat(res.data)
              if (int === end) {
                finished = true
                next(null, finished)
              } else {
                start = int + granularity * 1000
                next(null, finished)
              }
            }).catch(err=>{
              if (err.response.status === 429) {
                setTimeout(()=>next(null, finished), 500)
              } else { next(err) }
            })
          },
          (err, result)=>{
            done(err, array)
          }
        )
      },
      (data, done) => {
        let array = [], j=0
        if (this.props.period === '1h' || this.props.period === '24h') {
          for (let i=0; i<data.length; i++) {
            array.push({
              time: data[i][0],
              low: data[i][1],
              high: data[i][2],
              open: data[i][3],
              close: data[i][4],
              volume: data[i][5],
            })
          }
        } else if (this.props.period === '7d' || this.props.period === '30d' || this.props.period === '1y' || this.props.period === '5y') {
          let chunk = this.props.period === '7d' ? 2 : this.props.period === '30d' ? 8 : this.props.period === '1y' ? 4 : 20
          for (let i=0; i<data.length; i++) {
            let max = i, curArrays = {
              lows: [],
              highs: [],
              volumes: []
            }
            for (let j=i; j<i+chunk; j++) {
              max = j
              curArrays.lows.push(data[j][1])
              curArrays.highs.push(data[j][2])
              curArrays.volumes.push(data[j][5])
              if (j+1 === data.length) j = i+chunk
            }
            let reducer = (a,b) => a + b
            array.push({
              time: data[i][0],
              low: Math.min(...curArrays.lows),
              high: Math.max(...curArrays.highs),
              open: data[max][3],
              close: data[i][4],
              volume: curArrays.volumes.reduce(reducer),
            })
            i = i + chunk - 1
          }
        }
        array.sort((a,b)=>( a.time < b.time ? -1 : a.time > b.time ? 1 : 0 ))
        done(null, array)
      }
    ], (err, result)=>{
      if (!err) this.setState({data: result})
    })
  }

  componentDidUpdate(prevProps) {

    
    if (prevProps.details.product !== this.props.details.product) {
      this.getData()
    } else if (prevProps.period !== this.props.period) {
      this.getData()
    } else if (this.props.getData) {
      this.props.sendData(this.state.data)
    }
  }
  componentDidMount(){
    if(this.props.details.product && !this.props.data) {
      this.getData()
    } else if (this.props.data) {
      this.setState({data: this.props.data})
    }
  }
  componentWillUnmount(){
    this.state.tokenSource.cancel()
  }

  render(){
    return <Chart {...this.props} data={this.state.data} />
  }
}

