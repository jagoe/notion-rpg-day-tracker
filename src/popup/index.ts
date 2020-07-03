function run() {
  const test = document.getElementById('test')
  if (!test) {
    console.log('Oh noes!')
    return
  }

  test.textContent = 'Test'
}

run()
