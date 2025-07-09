import { app } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path: '.env',
})

connectDB()
    .then(() => {
        const PORT = process.env.PORT || 8000;
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${port} is already in use. Please use a different port.`);
                process.exit(1);
            } else {
                console.error('Server error:', err);
            }
        });
    })
    .catch((error) => {
        console.error("Failed to connect to the database:", error);
    });


process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Process terminated')
    })
})

process.on('SIGINT', () => {
    server.close(() => {
        console.log('Process interrupted')
    })
})