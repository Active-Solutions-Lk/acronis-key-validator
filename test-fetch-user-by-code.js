const testFetchUserByCode = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/fetch-user-by-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'EA548369' }),
    });

    const data = await response.json();
    console.log('API Response:', data);
  } catch (error) {
    console.error('Test error:', error);
  }
};

testFetchUserByCode();