export const validateProduct = (product) => {
  if (!product || typeof product !== 'object') {
    throw new Error('Invalid product data');
  }
  
  const required = ['id', 'name'];
  for (const field of required) {
    if (!product[field]) {
      throw new Error(`Product missing required field: ${field}`);
    }
  }
  
  // Validate price if present
  if (product.price && isNaN(parseFloat(product.price))) {
    throw new Error('Invalid product price');
  }
  
  return true;
};

export const validateCartItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('No items selected');
  }
  
  for (const item of items) {
    if (!item.id || !item.quantity) {
      throw new Error('Invalid cart item format');
    }
    
    if (item.quantity < 1) {
      throw new Error('Item quantity must be at least 1');
    }
  }
  
  return true;
};
