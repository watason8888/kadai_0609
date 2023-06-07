import { ref as dbRef, push, set, onChildAdded } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js";
import { ref as storageRef, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-storage.js";
import { app, db, storage } from './firebase.js';

const chatRef = dbRef(db, "chat"); //RealtimeDB内の"chat"を使う
console.log(app, db, chatRef);



onChildAdded(chatRef, async function(data) {  // <-- Make sure to add async here
    const msg = data.val();
    const key = data.key;
    const newDiv = $("<div/>").addClass("tabelog");
    let h= `
        <div class="test_wrap">
            <h1 class="test">
                <p>${msg.day}</p>
            </h1>
            <h2 class="test2">
                <p>${msg.ssname}</p>
            </h2>
            <h3 class="test3">
                <p>${msg.text}</p>
            </h3>
        </div>
        `
    newDiv.append(h);
    console.log("newDiv after appending image: ", newDiv.html());

    // Get the image
    const fileRef = storageRef(storage, msg.image);  // <-- Use the image path from the message
    try {
        const url = await getDownloadURL(fileRef);  // <-- Make sure to add await here
        console.log("URL: ", url);
        let img = $("<img />").attr('src', url).css({
            'width': '200px', 
            'height': '200px'
        });
        newDiv.append(img);
    } catch (error) {
        console.error(error);
    }
    $(".messages").append(newDiv);
    console.log("messages after appending newDiv: ", $(".messages").html());  // <-- Add this line
    
});

const inputRef = $("#uploadButton")[0];

const handleChange = () => {
    const file = $(inputRef).prop("files")[0];
    console.log(file.name);
    console.log(file.type);
    console.log(file.size);
};

const handleSubmit = async (file) => {  // <-- Make sure to add async here
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `images/${fileName}`;
    const fileRef = storageRef(storage, filePath);
    await uploadBytes(fileRef, file);
    console.log("Uploaded!");
    return filePath;  // <-- Return the file path
};


$("#uploadButton").on("change", function(event){
    const file = $(this).prop("files")[0];
    handleChange(file);
});

$("#pic2_send").on("click", async function(event){  // <-- Make sure to add async here
    event.preventDefault();
    const file = $("#uploadButton").prop("files")[0];
    const filePath = await handleSubmit(file);  // Pass the file to handleSubmit and get the file path
    const msg = {
        ssname: $("#ssname").val(),
        day: $("#day").val(),
        text: $("#text").val(),
        image: filePath,  // <-- Add the file path to the message
    };
    const newPostRef = push(chatRef);
    set(newPostRef, msg);

    $("#day").val("")
    $("#ssname").val("")
    $("#text").val("")
    $("#uploadButton").val('');
});


$(".clear").on("click", function(){
    $("#day").val("")
    $("#ssname").val("")
    $("#text").val("")
    $("#uploadButton").val('');
});

