import axios from 'axios'

export async function sendMessage(messageList) {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY

  try {
    const response = await axios.post(
      '/api/deepseek/chat/completions',
      {
        model: 'deepseek-v4-flash', // 官方最新推荐模型
        messages: messageList,
        temperature: 0.7,
        stream: false
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        }
      }
    )
    return response.data.choices[0].message.content
  } catch (error) {
    console.log('接口错误详情:', error.response?.data)
    console.error('完整错误:', error)
    return "请求失败，请检查配置"
  }
}