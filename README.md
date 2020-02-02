# mongodb-type-generator
Generate Typescript types from your MongoDB database!


## Usage
```
MONGO_URI=<your mongo URI> npx ts-node src/generate.ts
```

## Output
Suppose you have two collections: `coupons` and `orders`. An example output looks as follows:


```ts
type Coupon = {
    _id: string;
    code: string;
    discountPercentage: number;
};

type Order = {
    _id: string;
    orderId: string;
    placedAt: Date;
    lines: {
        title: string;
        quantity: number;
        price: number;
        productImage: string;
    }[];
    totalAmount: number;
    billingAddress: {
        street: string;
        city: string;
        country: string;
        state: string;
        zip: string;
    };
};
```

The types are derived from the first document it finds in the collection. 
