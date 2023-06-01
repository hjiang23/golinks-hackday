const express = require("express");
const axios = require('axios');

const app = express();

app.set("port", process.env.PORT || 3001);

app.get("/user", (req, res) => {
    const user = req.query.username;
    const forked = req.query.forked;
    console.log(forked);

    if (!user) {
        res.json({
          error: "Missing required parameter `user`"
        });
        return;
    }
    
    axios.get(`https://api.github.com/search/repositories?q=user:${user}+fork:true`, {
        headers: {
            'X-GitHub-Api-Version': '2022-11-28',
            'Accept' : 'application/vnd.github+json',
            // 'Authorization' : 'Bearer YOUR_TOKEN'
        }
    }).then(function (response) {
        // console.log(response.data);
        res.json({
            total_count : response.data.total_count,
            total_stargazers : 0,
            total_forks : 0,
            avg_size : 0,
            languages : 0
        });
    }).catch(function (error) {
        console.log(error);
    });
    
});

app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});