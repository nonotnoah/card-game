console.log('start');

async function test(num) {
  return num === 5
}

let num = 0
async function checkConnection() {
  num ++
  console.log('num:',num)
  return await test(num)
}

const loop = setInterval(async () => {
  const result = await checkConnection()
  console.log('result:',result)
  if (result) {
    clearInterval(loop)
    console.log('end');
  }
}, 1000)