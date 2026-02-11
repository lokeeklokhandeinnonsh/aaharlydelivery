export interface Order {
    id: string;
    name: string;
    meal: string;
    slot: string;
    address: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    phone: string;
    amount: number;
    date: string;
}

export const mockOrders: Order[] = [
    {
        id: "ORD001",
        name: "Parth Shikre",
        meal: "7-Day Weight Loss",
        slot: "Lunch",
        address: "Ravet, Pune",
        status: "PENDING",
        phone: "9876543210",
        amount: 250,
        date: "2024-02-07"
    },
    {
        id: "ORD002",
        name: "Anjali Mehta",
        meal: "High Protein Keto",
        slot: "Dinner",
        address: "Baner, Pune",
        status: "COMPLETED",
        phone: "9876543211",
        amount: 350,
        date: "2024-02-06"
    },
    {
        id: "ORD003",
        name: "Rahul Sharma",
        meal: "Vegan Delight",
        slot: "Lunch",
        address: "Wakad, Pune",
        status: "PENDING",
        phone: "9876543212",
        amount: 220,
        date: "2024-02-07"
    },
    {
        id: "ORD004",
        name: "Sneha Patil",
        meal: "Balanced Diet",
        slot: "Dinner",
        address: "Hinjewadi, Pune",
        status: "PENDING",
        phone: "9876543213",
        amount: 200,
        date: "2024-02-07"
    }
];
