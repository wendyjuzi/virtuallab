<template>
  <el-card>
    <div style="min-height: 200px;">
      <div v-for="(msg, idx) in messages" :key="idx" :style="{textAlign: msg.role === 'user' ? 'right' : 'left'}">
        <el-tag :type="msg.role === 'user' ? 'primary' : 'success'">{{ msg.role === 'user' ? '我' : '助教' }}</el-tag>
        <span style="margin: 0 8px;">{{ msg.content }}</span>
      </div>
    </div>
    <el-input
      v-model="input"
      placeholder="向智能助教提问..."
      @keyup.enter="send"
      :disabled="loading"
      style="margin-top: 16px;"
    />
    <el-button type="primary" @click="send" :loading="loading" style="margin-top: 8px;">发送</el-button>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const messages = ref<{role: string, content: string}[]>([])
const input = ref('')
const loading = ref(false)

const send = async () => {
  if (!input.value.trim()) return
  messages.value.push({ role: 'user', content: input.value })
  loading.value = true
  try {
    const res = await fetch('/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input.value })
    })
    const data = await res.json()
    messages.value.push({ role: 'assistant', content: data.reply })
    input.value = ''
  } catch (e) {
    ElMessage.error('AI 助教服务异常')
  } finally {
    loading.value = false
  }
}
</script> 