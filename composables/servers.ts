import type { ServerWithInfo, ServerResponse, ServerInfo, ServerQuery } from "~/types"

export function useServers() {
  const { $api } = useNuxtApp()

  const loading = ref(false)
  const error = ref(null)
  const servers = ref<ServerWithInfo[]>([])

  const total = ref(0)

  const query = reactive<ServerQuery>({
    name: "",
    host: "",
    owned_by: "",
    limit: 30,
    offset: 0,
  })

  watch(query, getServers)

  async function getServers() {
    try {
      loading.value = true

      const serverData: ServerResponse | undefined = await $api("/servers", {
        query: validQuery(query),
      })
      if (serverData) {
        total.value = serverData.total

        const hosts = serverData.values.map((server) => ({
          ip: server.host,
          port: server.port,
        }))
        const infoData = await $fetch<(ServerInfo | null)[]>("/ping", {
          method: "POST",
          body: {
            hosts,
          },
        })

        servers.value = serverData.values.map((s, index) => ({
          ...s,
          info: infoData[index] as ServerInfo | null,
        }))
      } else {
        servers.value = []
        total.value = 0
      }
    } catch (err) {
      console.error(err)
      servers.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  return {
    servers,
    loading,
    error,
    query,
    total,
    getServers,
  }
}
