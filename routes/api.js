// Import required modules and initialize environment variables
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const {createClient} = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET /login/:username - Returns user details based on the user's role
router.post('/login/:username', async (req, res) => {
    try {
        const username = req.params.username;
        pass_hash=req.body.password;
        console.log("Got request for ",username,pass_hash);

        logged=false

        // Query the "users" table to get the user's role
        const {data: roleData, error: roleError} = await supabase
            .from('users')
            .select('role')
            .eq('userid', username).eq('password_hash', pass_hash);

        if (roleError || !roleData || roleData.length === 0) {
            return res
                .json({error: "Invalid user ID", data: null});
        }

        const role = roleData[0].role;
        console.log(`Fetched role for ${username}: ${role}`);

        let userDetails;

        // Fetch data based on the user's role
        if (role === "admin") {
            const {data: adminData, error: adminError} = await supabase
                .from('users')
                .select(
                    `
    userid,
    role,
    password_hash
    
    `,
                );
            if (adminError) {
                return res
                    .status(400)
                    .json({error: adminError.message, data: null});
            }
            userDetails = adminData;
        } else if (role === "basic") {
            const {data: basicData, error: basicError} = await supabase
                .from('users')
                .select(
                    `
    userid,
    role,
    password_hash
    `,
                )
                .eq('userid', username);
            if (basicError) {
                return res
                    .status(400)
                    .json({error: basicError.message, data: null});
            }
            userDetails = basicData;
        } else {
            return res
                .status(403)
                .json({error: "Unauthorized role", data: null});
        }

        // Return a successful response with error: null
        return res.json({error: false, data: userDetails});
    } catch (err) {
        return res
            .status(500)
            .json({error: "Server error: " + err.message, data: null});
    }
});

// GET /health - Verifies the connection to Supabase
router.get('/health', async (req, res) => {
    try {
        const {data, error} = await supabase.from('users').select('*');
        if (error) {
            return res
                .status(400)
                .json({error: error.message, data: null});
        }
        return res
            .status(200)
            .json({error: null, message: "Connection to Supabase was successful!"});
    } catch (err) {
        return res
            .status(500)
            .json({error: "Server error: " + err.message, data: null});
    }
});

module.exports = router;
