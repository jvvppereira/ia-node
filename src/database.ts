const products: {name:string, inventory:number}[] = [
    { name: "Honey", inventory: 10 },
    { name: "Coffee", inventory: 5 },
    { name: "Bread", inventory: 0 },
    { name: "Milk", inventory: 0 },
    { name: "Eggs", inventory: 12 },
    { name: "Cheese", inventory: 3 },
    { name: "Butter", inventory: 0 },
];

export const getProductsInventory = () => {
    return products.filter(product => product.inventory > 0).map(product => product.name);
};

export const getProductsMissingInventory = () => {
    return products.filter(product => product.inventory === 0).map(product => product.name);
};