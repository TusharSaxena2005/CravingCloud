import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors());

app.use(express.json({
    limit: '1600kb'
}))

app.use(express.urlencoded({
    extended: true,
    limit: '1600kb'
}))

app.use(express.static("public"))

app.use(cookieParser())

import userRouter from './routes/user.routes.js';
import tableRouter from './routes/table.routes.js';
import staffRouter from './routes/staff.routes.js';
import restaurantRouter from './routes/restaurant.routes.js';
import perDaySellRouter from './routes/perdaysell.routes.js';
import orderHistoryRouter from './routes/orderhistory.routes.js';
import menuRouter from './routes/menu.routes.js';
import kitchenRouter from './routes/kitchen.routes.js';
import inventoryRouter from './routes/inventory.routes.js';

app.use('/api/v1/user', userRouter);
app.use('/api/v1/table', tableRouter);
app.use('/api/v1/staff', staffRouter);
app.use('/api/v1/restaurant', restaurantRouter);
app.use('/api/v1/perdaysell', perDaySellRouter);
app.use('/api/v1/orderhistory', orderHistoryRouter);
app.use('/api/v1/menu', menuRouter);
app.use('/api/v1/kitchen', kitchenRouter);
app.use('/api/v1/inventory', inventoryRouter);

export { app };