<script setup lang="ts">
import type { Record } from "~/types"

const props = defineProps<{
  records: Record[] | null
  loading: boolean
}>()

const { t } = useI18n()

const { expand, toggleSelect } = useExpand()

const columns = computed(() => {
  return [
    {
      key: "rank",
      label: t("records.title.rank"),
    },
    {
      key: "player",
      label: t("records.title.player"),
    },
    {
      key: "time",
      label: t("records.title.time"),
    },
    {
      key: "nub_points",
      label: t("records.title.nubPoints"),
    },
    {
      key: "pro_points",
      label: t("records.title.proPoints"),
    },
    {
      key: "submitted_at",
      label: t("records.title.date"),
    },
  ]
})

const rows = computed(() => {
  return props.records?.map((record, index) => ({
    rank: `#${index + 1}`,
    ...record,
  }))
})
</script>

<template>
  <div class="mt-2">
    <UCard :ui="{ body: { padding: '' } }">
      <UTable
        v-model:expand="expand"
        :ui="{
          th: { size: 'text-base', padding: 'py-2' },
          td: { size: 'text-base', padding: 'py-2' },
          tr: { base: 'hover:bg-gray-800 transition ease-in' },
        }"
        :columns="columns"
        :rows="rows"
        @select="toggleSelect">
        <template #rank-data="{ row }">
          {{ row.rank }}
        </template>

        <template #player-data="{ row }">
          <NuxtLink
            :to="`/profile/${row.player_id}`"
            class="py-2 px-2 lg:px-0 text-cyan-600 whitespace-nowrap hover:text-cyan-400">
            {{ row.player.name }}
          </NuxtLink>
        </template>

        <template #time-data="{ row }">
          <span class="text-slate-300">{{ formatTime(row.time) }}</span>
        </template>

        <template #nub_points-data="{ row }">
          {{ row.nub_points ? Math.floor(row.nub_points) : "-" }}
        </template>

        <template #pro_points-data="{ row }">
          {{ row.pro_points ? Math.floor(row.pro_points) : "-" }}
        </template>

        <template #teleports-data="{ row }">
          {{ row.teleports }}
        </template>

        <template #submitted_at-data="{ row }">
          {{ toLocal(row.submitted_at) }}
        </template>

        <template #expand="{ row }">
          <div class="p-3">
            <RecordDetail :detailed="false" :record="row as Record" />
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
