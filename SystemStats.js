import si from "systeminformation";
import os from "os";
import readline from 'readline';


// 按鍵監聽
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);

// 容量單位換算
function formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    let toFixedNum = 2;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
      if(unitIndex==0){
        toFixedNum=0;
      }
    }
    return `${size.toFixed(toFixedNum)} ${units[unitIndex]}`;
  }

  // 時間單位換算
  function secondToTime(timeType,second){
    const days = Math.floor(second / 86400);
    const hours = Math.floor((second % 86400) / 3600);
    const minutes = Math.floor((second % 3600) / 60);
    const seconds = second % 60;

    switch(timeType){
        case 'days':
            return `${days}天`;
        case 'hours':
            return `${hours}時`;
        case 'minutes':
            return `${minutes}分`;
        default:
          if(days>0){
              return `${days}天${hours}時${minutes}分${seconds}秒`;
          }else if(hours>0){
              return `${hours}時${minutes}分${seconds}秒`;
          }else if(minutes>0){
              return `${minutes}分${seconds}秒`;
          }else{
              return `${seconds}秒`;
          }
    }

  }
  
  // 取得系統資訊
  async function getSystemInfo() {
    try {
    const cpu = await si.currentLoad().then(data=>data.currentLoad.toFixed(2));
      const mem = await si.mem();
      const usedMem = formatBytes(mem.buffcache);
      const totalMem = formatBytes(mem.total);
      const memUsagePercent = ((mem.buffcache / mem.total) * 100).toFixed(2);
      const memUseractive = formatBytes(mem.active);
      const battery = await si.battery();
      let isCharging = battery.isCharging ? '充電中' : '未充電';
      let timeRemaining = battery.timeRemaining ? `剩餘時間 : ${secondToTime('hours',battery.timeRemaining)}` : '';
      const network = await si.networkStats(si.defaultInterface);
      
      console.clear();
      console.log('===效能監測===');
      console.log(`CPU : ${cpu}%`);
      console.log(`記憶體 : ${memUseractive} / ${usedMem} / ${totalMem} (${memUsagePercent}%)[非積極]`);
      console.log(`系統運行時間 : ${secondToTime('',Math.floor(os.uptime()))}`);
      console.log(`電池容量 : ${battery.percent}% ${isCharging} ${timeRemaining}`);
      console.log(`網路 : ↓:${formatBytes(network[0].rx_sec)}/s / ↑:${formatBytes(network[0].tx_sec)}/s`);
      
      console.log('|s 暫停|c 退出|');

      
    } catch (err) {
      console.error('錯誤:', err);
    }
  }
  
let isRunning = true;
let intervalId = setInterval(getSystemInfo, 1000);

//cmd監聽控制
process.stdin.on('keypress', (key) => {
  if (key === 'c') {
    process.exit();
  }else if (key === 's') {
      if (isRunning) {
        clearInterval(intervalId);
        isRunning = false;
        console.clear();
        console.log('監測已暫停，|r 繼續|c 退出|');
      }
    } else if (key === 'r') {
      if (!isRunning) {
        intervalId = setInterval(getSystemInfo, 1000);
        isRunning = true;
        console.log('監測運行');
      }
}})