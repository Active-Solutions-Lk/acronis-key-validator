const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/fetch-user-by-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: 'EA548369'
      })
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

testAPI();