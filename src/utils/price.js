// src/utils/price.js
export const parsePrice = (priceHtml) => {
  if (!priceHtml) return { amount: 0, currency: 'USD', formatted: '$0.00' };
  
  try {
    // Create a safe parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(priceHtml, 'text/html');
    
    // Extract price text
    const priceText = doc.body.textContent || '';
    
    // Extract currency symbol and amount
    const currencyMatch = priceText.match(/[$£€¥]/);
    const currency = currencyMatch ? currencyMatch[0] : '$';
    
    // Extract numeric value
    const amountMatch = priceText.match(/[\d,]+\.?\d*/);
    const amount = amountMatch ? parseFloat(amountMatch[0].replace(/,/g, '')) : 0;
    
    // Format consistently
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === '$' ? 'USD' : 
               currency === '£' ? 'GBP' : 
               currency === '€' ? 'EUR' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    
    return { amount, currency, formatted };
  } catch (error) {
    console.error('Price parsing error:', error);
    return { amount: 0, currency: 'USD', formatted: '$0.00' };
  }
};

export const formatPrice = (priceHtml) => {
  if (!priceHtml) return '';
  
  // Parse the HTML safely
  const parser = new DOMParser();
  const doc = parser.parseFromString(priceHtml, 'text/html');
  
  // Extract text content
  const priceText = doc.body.textContent || '';
  
  // If it's already formatted currency, return as is
  if (priceText.includes('$')) return priceText;
  
  // Otherwise, format it
  const price = parseFloat(priceText);
  if (isNaN(price)) return '';
  
  return price.toLocaleString(undefined, { 
    style: 'currency', 
    currency: 'USD' 
  });
};