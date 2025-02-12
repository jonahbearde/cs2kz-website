<script setup lang="ts">
import type { ServerWithInfo } from "~/types"

const { t } = useI18n()

const { expand, toggleSelect } = useExpand()

const props = defineProps<{
  servers: ServerWithInfo[]
  loading: boolean
}>()

const columns = computed(() => {
  return [
    { key: "name", label: t("servers.title.name") },
    { key: "ip", label: t("servers.title.ipAddress") },
    { key: "owner", label: t("servers.title.owner") },
    { key: "date", label: t("servers.title.createdOn") },
    { key: "ping", label: t("servers.title.ping") },
  ]
})

const rows = computed(() => {
  return props.servers.map((server) => ({
    id: server.id,
    name: server.name,
    ip: `${server.host}:${server.port}`,
    owner: server.owner.name,
    owner_id: server.owner.id,
    date: toLocal(server.approved_at),
    ping: server.info ? server.info.ping : null,
    info: server.info,
  }))
})

const pingColors = {
  good: "text-green-400",
  mid: "text-orange-400",
  bad: "text-red-400",
}

function connect(ip: string) {
  const url = `steam://rungameid/730//+connect ${ip}`
  navigateTo(url, { external: true })
}
</script>

<template>
  <div class="mt-8">
    <UCard :ui="{ body: { padding: '' } }">
      <UTable
        v-model:expand="expand"
        :ui="{
          th: { size: 'text-base', padding: 'py-2' },
          td: { size: 'text-base', padding: 'py-2' },
          tr: { base: 'hover:bg-gray-800 transition ease-in' },
        }"
        :loading="loading"
        :columns="columns"
        :rows="rows"
        @select="toggleSelect">
        <template #name-data="{ row }">
          <p>{{ row.name }}</p>
        </template>

        <template #ip-data="{ row }">
          <div class="inline-flex items-center gap-2">
            <p>{{ row.ip }}</p>
            <UButton
              variant="ghost"
              :ui="{
                padding: { sm: 'p-1' },
                variant: { ghost: 'dark:hover:bg-green-400/40' },
              }"
              @click="connect(row.ip)">
              <IconConnect />
            </UButton>
          </div>
        </template>

        <template #owner-data="{ row }">
          <NuxtLink :to="`/profile/${row.owner_id}`" class="text-cyan-600 whitespace-nowrap hover:text-cyan-400">
            {{ row.owner }}
          </NuxtLink>
        </template>

        <template #date-data="{ row }">
          <p>{{ row.date }}</p>
        </template>

        <template #ping-data="{ row }">
          <span v-if="row.info" :class="pingColors[row.info.connection as keyof typeof pingColors]">{{
            row.ping
          }}</span>
          <IconNoConnection v-else class="inline" />
        </template>

        <template #expand="{ row }">
          <div class="p-2 text-gray-300">
            <ServerInfo v-if="row.info" :info="row.info" />
            <span v-else>{{ $t("common.noData") }}</span>
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<style scoped>
:deep(tr th:first-of-type) {
  width: 1rem;
}
</style>
