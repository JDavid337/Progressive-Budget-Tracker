const { get } = require("../routes/api");

const indexedDB = 
    window.indexdED ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

    let db
    
    const request = indexedDB.open("budget, 1")

    request.onupgradeneeded = function (event) {
        const db = event.target.result
        db.CreateObjectStore("pending", { autoIncrement: true })
    }

    request.onsuccess = function (event) {
        const db = event.target.result
        if (navigator.onLine) {
            checkDatabase()
        }
    }

    request.onerror = function(event) {
        console.log("Whoops! " + event.target.errorCode);
    };

    function checkDatabase() {

        const transaction = db.transaction(["pending"], "readwrite")

        const store = transaction.objectStore("pending")

        const getAll = store.getAll()

        getAll.onsuccess = function() {
            if (getAll.result.length > 0 ) {
                fetch('/api/transaction/bulk', {
                    method: 'POST',
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: 'application.json, text/plain, */*',
                        "Content Type": "application.json",
                    }
                })
                    .then((response) => response.json())
                    .then(() => {
                        const transaction = db.transaction("pending")

                        store.clear()
                    })
            }
        }
    }

    function saveRecord(record) {
        const transaction = db.transaction(['pending'], 'readwrite')

        const store = transaction.objectStore('pending')

        store.add(record)
    }

window.addEventListener("online", checkDatabase)