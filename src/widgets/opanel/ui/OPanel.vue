<template>
  <div class="bg-gray-200 dark:bg-bg-accent-dark p-5 rounded-lg shadow-lg w-full">
    <div class="flex flex-col gap-5">
      <div class="flex justify-between items-center border-b border-zinc-800 dark:border-gray-700 pb-3">
        <h2 class="text-xl font-semibold text-zinc-800 dark:text-gray-300">Организации</h2>
        <button
          @click="handleCreateOrg"
          class="p-2 text-zinc-800 dark:text-gray-400 hover:text-blue-500 transition-colors"
          title="Создать организацию"
        >
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>

      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-24 bg-zinc-800 dark:bg-gray-600 rounded-md animate-pulse"></div>
      </div>
      
      <div v-else class="space-y-3">
        <OPanelCard 
          v-for="org in orgs" 
          :key="org.id" 
          :org="org"
          :is-selected="selectedOrgId === org.id"
          @select="selectOrg(org)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import OPanelCard from './OPanelCard.vue'
import { supabaseHelper } from '../../../shared/api/sbHelper'
import { user } from '../../../shared/lib/auth'
import type { Orgs } from '../../../entities/org/types'

defineProps<{
  selectedOrgId?: string
}>()

const emit = defineEmits(['select'])

const orgs = ref<Orgs[]>([])
const loading = ref(false)
const router = useRouter()

const fetchOrgs = async () => {
  try {
    loading.value = true
    orgs.value = await supabaseHelper.fetchOrgs(user.value.email)
    if (orgs.value.length > 0) {
      emit('select', orgs.value[0])
    }
  } catch (error) {
    console.error('Error fetching orgs:', error)
  } finally {
    loading.value = false
  }
}

const selectOrg = (org: Orgs) => {
  emit('select', org)
}

const handleCreateOrg = () => {
  router.push({ name: 'create-organization' })
}

fetchOrgs()
</script>