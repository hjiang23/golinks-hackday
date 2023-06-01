const express = require("express");
const axios = require('axios');

const app = express();

app.set("port", process.env.PORT || 3001);

app.get("/user", (req, res) => {
    const user = req.query.username;
    const forked = req.query.forked;

    if (!user) {
        res.json({
          error: "Missing required parameter `user`"
        });
        return;
    }
    
    let query;

    if (!forked || forked === 'false') {
        query = `https://api.github.com/search/repositories?q=user:${user}`;
    }

    else {
        query = `https://api.github.com/search/repositories?q=user:${user}+fork:true`
    }

    axios.get(query, {
        headers: {
            'X-GitHub-Api-Version': '2022-11-28',
            'Accept' : 'application/vnd.github+json',
            // 'Authorization' : 'Bearer YOUR TOKEN'
        }
    }).then(function (response) {
        res.json({
            total_count : response.data.total_count,
            total_stargazers : getTotalStargazers(response.data.items),
            total_forks : getTotalForks(response.data.items),
            avg_size : getAverageSize(response.data.items),
            languages : getLanguages(response.data.items)
        });
        res.status(200);
    }).catch(function (error) {
        console.log(error);
        res.status(404).send("User not found.");
        res.json([]);
    });
    
});

app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); 
});

function getTotalStargazers(items) {
        
    let sum = 0;
    
    for (let i = 0; i < items.length; i++) {
        sum += items[i].stargazers_count;
    }

    return sum;
}

function getTotalForks(items) {
    let sum = 0;
    
    for (let i = 0; i < items.length; i++) {
        sum += items[i].forks_count;
    }

    return sum;
}

function getAverageSize(items) {
    let sum = 0;

    for (let i = 0; i < items.length; i++) {
        sum += items[i].size;
    }

    let average = sum/items.length

    if (average > 1000000000) {
        return (average/1000000000).toFixed(2) + ' GB';
    }

    else if (average > 1000000) {
        return (average/1000000).toFixed(2) + ' MB';
    }

    else {
        return (average/1000).toFixed(2) + ' KB';
    }
}

function getLanguages(items) {
    let obj = {};

    for (let i = 0; i < items.length; i++) {
        
        if (items[i].language == null) {
            continue;
        }
        
        if (items[i].language in obj) {
            obj[`${items[i].language}`]++;
        }
        else {
            obj[`${items[i].language}`] = 1;
        }
        
    }

    const sorted = Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .reduce(
        (r, [k, v]) => ({
        ...r,
        [k]: v
        }),
        {}
    )

    return sorted;
}