const generateFakeUsers = () => {
    const fakeUsers = [
        { id: 1, name: 'John Doe', balance: 500, phone: '+919122123123' },
        { id: 2, name: 'Jane Doe', balance: 1500, phone: '+919122123124' },
        { id: 3, name: 'John Smith', balance: 2500, phone: '+919122123125' },
        { id: 4, name: 'Jane Smith', balance: 3500, phone: '+919122123126' },
        { id: 5, name: 'John Wick', balance: 4500, phone: '+919122123127' },
        { id: 6, name: 'Jane Wick', balance: 5500, phone: '+919122123128' },
        { id: 7, name: 'John Snow', balance: 6500, phone: '+919122123129' },
        { id: 8, name: 'Jane Snow', balance: 7500, phone: '+919122123130' },
        { id: 9, name: 'John Cena', balance: 8500, phone: '+919122123131' },
        { id: 10, name: 'Jane Cena', balance: 9500, phone: '+919122123132' },
        
    ];
   // Add trade histories for each user
  fakeUsers.forEach(user => {
    user.tradeHistory = generateTradeHistory();
  });

  return fakeUsers;
};

const generateTradeHistory = () => {
  const tradeHistory = [];
  for (let i = 1; i <= 5; i++) {
    const trade = {
      tradeId: i,
      instrument: `Instrument ${i}`,
      qty: Math.floor(Math.random() * 10) + 1, // Random qty between 1 and 10
      price: parseFloat((Math.random() * 100).toFixed(2)), // Random price between 0 and 100
      timestamp: new Date().toISOString(),
    };
    tradeHistory.push(trade);
  }
  return tradeHistory;
};

module.exports = generateFakeUsers;