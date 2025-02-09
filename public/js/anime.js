
document.addEventListener("DOMContentLoaded", () => {
    const openModal = document.getElementById("openModal");
    const closeModal = document.getElementById("closeModal");
    const modalBackdrop = document.getElementById("modalBackdrop");
    const modal = document.getElementById("modal");
    let response,username,pass_hash,table;

    // Open modal and fetch Details
    openModal.addEventListener("click", async () => {

        username=document.getElementById("username").value;
        pass_hash=document.getElementById("password").value;

        //Deleting existing data from table
        table = document.getElementById("dataTable").
        getElementsByTagName('tbody')[0];
        const rowCount = table.rows.length;
        for (let i = rowCount - 1; i >= 0; i--) {
            table.deleteRow(i);
        }

        //Fetching resposne
        try{
            response = await login(username, md5(pass_hash));

            console.log(response["data"],username,pass_hash);

            //Is Credentials are correct
            if (!response["error"]) {

                document.getElementById("success").innerHTML ="Succesful";
                document.getElementById("error").innerHTML ="";
                console.log(response);
                table = document.getElementById("dataTable").
                getElementsByTagName('tbody')[0];
                let user_details=response["data"];
                const rowCount = table.rows.length;
                for (let i = rowCount - 1; i >= 0; i--) {
                    table.deleteRow(i);
                }
                for (i=0,len=user_details.length; i<len ;i++){
                    console.log(user_details[i]["userid"]);
                    let row=user_details[i];
                    let newRow=table.insertRow()
                    let useridCell=newRow.insertCell(0);
                    let roleCell=newRow.insertCell(1);
                    let password_hashCell=newRow.insertCell(2);
                    //
                    useridCell.innerHTML=row["userid"];
                    roleCell.innerHTML=row["role"];
                    password_hashCell.innerHTML=row["password_hash"];



                }


            }

            else{
                document.getElementById("error").innerHTML =error;
                document.getElementById("success").innerHTML ="";
            }

        }

        catch (error) {
            console.log("error", error);
            document.getElementById("error").innerHTML =error;
            document.getElementById("success").innerHTML ="";
        }



        // Remove previous closing animation if any
        modal.classList.remove("animate-popDown");
        modal.classList.remove("animate-popUp");
        modalBackdrop.classList.remove("hidden");

        // Trigger reflow to restart animation if needed
        void modal.offsetWidth;
        modal.classList.add("animate-popUp");


    });

    // Function to handle closing of modal with animation
    const closeModalFn = () => {
        modal.classList.remove("animate-popUp");
        modal.classList.add("animate-popDown");
    };

    // Close when clicking the close icon
    closeModal.addEventListener("click", closeModalFn);

    // Optionally, close modal when clicking outside the modal content
    modalBackdrop.addEventListener("click", (e) => {
        if (e.target === modalBackdrop) {
            closeModalFn();
        }
    });

    // Hide the backdrop when the close animation finishes
    modal.addEventListener("animationend", (e) => {
        if (e.animationName === "popDown") {
            modalBackdrop.classList.add("hidden");
            modal.classList.remove("animate-popDown");
        }
    });

});
async function login(username, password) {
    const url = `./api/login/${encodeURIComponent(username)}`;
    const params = new URLSearchParams();
    params.append('password', password);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    });

    if (!response.ok) {
        throw new Error(`Network error: ${response.statusText}`);
    }

    return await response.json();
}
