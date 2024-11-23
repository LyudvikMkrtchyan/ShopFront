
    document.getElementById('login-form').addEventListener('submit', async (event) => {;
    event.preventDefault();
    
    localStorage.setItem('host', '192.168.1.28');
    localStorage.setItem('port', '9091');
        
      
        const login = document.getElementById('username').value;
        const password = document.getElementById('password').value;
         
        if (!login || !password) {
            alert('Please enter a username and password');
            return;
        }
        else {
            const Data = {
                password: password,
                login: login
            }

            const host = localStorage.getItem('host');
            const port = localStorage.getItem('port');
            const command = 'login';
            const URL = `http://${host}:${port}/${command}`

        try {
            const response = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Data)
            });
            

 
            if (response.ok) {
                const jsonResponse = await response.json();
                console.log(jsonResponse);
                localStorage.setItem('userId', jsonResponse.userid);
                const role = jsonResponse.role
                redirectToPage(role);
            } else {
              alert('Error')
            }
        } catch (error) {
           alert('Connection error')
        }
    }

    });

    function redirectToPage(role) {
        switch (role) {
            case 'admin':
                window.location.href = './Home/home.html';
                break;
        }
    }