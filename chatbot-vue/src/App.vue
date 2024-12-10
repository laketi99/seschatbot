<template>
  <div id="app" class="container">
    <header>
      <img
        src="https://www.giantbomb.com/a/uploads/square_medium/0/8960/2359687-cortana.png"
        alt="Cortana Avatar"
        class="avatar"
      />
      <h1>Chat with Cortana</h1>
    </header>

    <main>
      <div id="chatbox" class="chatbox">
        <div v-for="(message, index) in chatMessages" :key="index" class="chat-message">
          <div v-if="message.user" class="user-message">
            <strong>You:</strong> {{ message.user }}
          </div>
          <div v-if="message.bot" class="bot-message">
            <strong>Cortana:</strong> {{ message.bot }}
          </div>
        </div>
        <div v-if="isLoading" class="bot-message">Cortana is typing...</div>
      </div>

      <div class="chat-input">
        <input
          v-model="userMessage"
          type="text"
          placeholder="Type your message here..."
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage" class="btn btn-primary">Send</button>
      </div>

      <div class="pdf-upload">
        <h2>Upload PDF for Review</h2>
        <input type="file" @change="uploadPDF" />
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      chatMessages: [],
      userMessage: "",
      isLoading: false,
    };
  },
  methods: {
    async sendMessage() {
      if (!this.userMessage.trim()) return;

      const userMsg = this.userMessage.trim();
      this.chatMessages.push({ user: userMsg });
      this.userMessage = "";
      this.isLoading = true;

      try {
        const response = await axios.post("http://localhost:5000/api/chat", {
          message: userMsg,
        });
        this.chatMessages.push({ bot: response.data.reply });
      } catch (error) {
        console.error("Error sending message:", error);
        this.chatMessages.push({ bot: "An error occurred. Please try again later." });
      } finally {
        this.isLoading = false;
      }
    },
    async uploadPDF(event) {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post("http://localhost:5000/api/upload", formData);
        this.chatMessages.push({
          user: "Uploaded a PDF for review",
          bot: response.data.review || "Error processing the PDF.",
        });
      } catch (error) {
        console.error("Error uploading PDF:", error);
        this.chatMessages.push({ bot: "An error occurred while processing the file." });
      }
    },
  },
};
</script>

<style>
body {
  font-family: Arial, sans-serif;
  background-color: #1e1e2f;
  color: white;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background-color: #2b2b3d;
  border-radius: 10px;
  text-align: center;
}

header {
  margin-bottom: 20px;
}

.avatar {
  border-radius: 50%;
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
}

h1 {
  font-size: 24px;
  color: #80d8f7;
}

.chatbox {
  height: 400px;
  overflow-y: scroll;
  border: 1px solid #ccc;
  background-color: #1a1a2e;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 10px;
}

.chat-message {
  margin: 15px 0;
}

.user-message {
  text-align: right;
  background-color: #4caf50;
  padding: 10px;
  border-radius: 8px;
  color: white;
}

.bot-message {
  text-align: left;
  background-color: #2d88ef;
  padding: 10px;
  border-radius: 8px;
  color: white;
}
</style>
