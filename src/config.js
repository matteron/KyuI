const ports = {
    work: 44306,
    mac: 5001,
}
module.exports = process.env.NODE_ENV === "development"
    ? {
        url: `https://localhost:${ports.work}/`
    } : {
       url: 'https://kyu.mattia.love/' 
    }
