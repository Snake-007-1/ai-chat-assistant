<template>
  <div class="chat-container">
    <h2 class="title">AI 聊天助手 🤖</h2>

<div class="toolbar">
  <button class="clear-btn" @click="clearHistory">
    🗑 清空聊天记录
  </button>
</div>


    <!-- 消息列表 -->          
    <div class="message-list"
    ref="messageListRef">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="message-item"
        :class="msg.role"
      >
        <strong>{{ msg.role === 'user' ? '用户' : 'AI' }}:</strong>
       <div v-html="renderMarkdown(msg.content)"></div>
      </div>

      <!-- 加载中提示 -->
      <div v-if="isLoading" class="message-item ai">
        <strong>AI:</strong>
        <span>正在思考中...</span>
      </div>
    </div>



    <!-- 输入区域 -->
    <div class="input-bar">
      <input
        v-model="inputValue"
        placeholder="输入内容"
        :disabled="isLoading"
        @keyup.enter="handleSend"
      />
      <button @click="handleSend" :disabled="isLoading">
        发送
      </button>
    </div>
  </div>
</template>

<script setup>
// 对应教程第2步：导入生命周期钩子
import { ref, onMounted ,nextTick} from 'vue'
import { sendMessage } from '../api/chat.js'
import MarkdownIt from 'markdown-it'    //新增
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'   // 你可以换成其他主题，如 atom-one-dark.css

const md = new MarkdownIt({           
  breaks: true,
  html: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="hljs">${
          hljs.highlight(str, { language: lang }).value
        }</code></pre>`
      } catch (__) {}
    }

    return `<pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`
  }
})

// 消息数组，存储所有聊天记录
const inputValue = ref('')
const messages = ref([])
const isLoading = ref(false)

const renderMarkdown = (text) => {
  return md.render(text || '')
}

//新添加
const messageListRef = ref(null)

// 对应教程第2步：页面加载完成时，读取本地保存的聊天记录
onMounted(() => {
  const saved = localStorage.getItem('chatHistory')
  if (saved) {
    // 把字符串转回数组，赋值给消息列表
    messages.value = JSON.parse(saved)
  }
})

const scrollToBottom = async () => {
  await nextTick()

  if (messageListRef.value) {
    messageListRef.value.scrollTop =
      messageListRef.value.scrollHeight
  }
}

const handleSend = async () => {
  const text = inputValue.value.trim()
  if (!text || isLoading.value) return

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: text
  })
  await scrollToBottom()
  // 对应教程第3步：用户消息发送后，立即保存到本地
  localStorage.setItem('chatHistory', JSON.stringify(messages.value))

  inputValue.value = ''
  isLoading.value = true

  try {
    // 传入完整对话历史，AI 能记住上下文
    const reply = await sendMessage(messages.value)
    messages.value.push({
      role: 'assistant',
      content: reply
    })
    await scrollToBottom()
    // 对应教程第3步：AI回复后，再次保存最新记录
    localStorage.setItem('chatHistory', JSON.stringify(messages.value))
  } finally {
    isLoading.value = false
  }
}

const clearHistory = () => {
  if (confirm('确定要清空所有聊天记录吗？')) {
    messages.value = []
    localStorage.removeItem('chatHistory')
  }
}

</script>

<style scoped>

.title {
  text-align: center;
  margin-bottom: 20px;
}

.chat-container {
  max-width: 700px;
  margin: 30px auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  height: 80vh;
}
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 12px;
}
.message-item {
  max-width: 65%;
  padding: 12px;
  margin: 12px 0;
  border-radius: 16px;
  line-height: 1.6;
  word-break: break-word;
}

.message-item.user {
  background: #95ec69;
  margin-left: auto;
  text-align: left;
  box-shadow: 0 2px 6px rgba(0,0,0,.08);
}

.message-item.assistant {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  box-shadow: 0 2px 6px rgba(0,0,0,.08);
}
.input-bar {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.input-bar input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.input-bar button {
  padding: 8px 20px;
  border: none;
  background: #42b983;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
.input-bar button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.message-item h1 {
  font-size: 24px;
  margin: 10px 0;
}

.message-item h2 {
  font-size: 20px;
  margin: 8px 0;
}

.message-item ul {
  padding-left: 20px;
}

.message-item pre {              
  background: #1e1e1e;
  color: white;
  padding: 10px;
  border-radius: 8px;
  overflow-x: auto;
}
.message-item pre {
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 10px 0;
}

.message-item code {
  font-family: Consolas, monospace;
}

.message-item pre code {
  display: block;
  line-height: 1.5;
}

/* 工具栏容器 */
.toolbar {
  margin-bottom: 10px;
  text-align: right;
}

/* 清空按钮 */
.clear-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.clear-btn:hover {
  opacity: 0.9;
}
</style>