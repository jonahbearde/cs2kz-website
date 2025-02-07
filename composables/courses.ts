import type { Tier, CourseExt, MapResponse, CourseQuery } from "~/types"
import { debounce } from "radash"
import { v4 as uuidv4 } from "uuid"

export function useCourses() {
  const { $api } = useNuxtApp()

  const loading = ref(false)

  const allCourses = ref<CourseExt[]>([])
  const courses = ref<CourseExt[]>([])

  const total = ref(0)

  const query = reactive<CourseQuery>({
    name: "",
    mode: "classic",
    has_teleports: "overall",
    sort_by: "map",
    sort_order: "ascending",
    created_after: null,
    created_before: null,
    limit: 30,
    offset: 0,
  })

  const debouncedUpdate = debounce({ delay: 300 }, update)

  watch(
    () => ({ ...query }),
    async (newQuery, oldQuery) => {
      if (newQuery.mode !== oldQuery.mode || newQuery.has_teleports !== oldQuery.has_teleports) {
        await getCourses()
        update(query)
      } else if (newQuery.name !== oldQuery.name) {
        debouncedUpdate(query)
      } else {
        update(query)
      }
    },
    { deep: true },
  )

  function update(query: CourseQuery) {
    if (allCourses.value !== null && allCourses.value.length > 0) {
      const searched = search(allCourses.value, query.name)
      const tiered = matchTier(searched, query.tier)
      const sorted = sort(tiered, query.sort_order, query.sort_by)
      // TODO: date filter
      const paginated = sorted.slice(query.offset, query.limit)
      courses.value = paginated
    }
  }

  function search(data: CourseExt[], name: string) {
    if (name === "") {
      return data
    }

    return data.filter((course) => course.name.toLowerCase().includes(name) || course.map.toLowerCase().includes(name))
  }

  function matchTier(data: CourseExt[], tier?: Tier) {
    if (!tier) {
      return data
    } else {
      return data.filter((course) => course.tier === tier)
    }
  }

  async function getCourses() {
    try {
      loading.value = true

      // fetch all maps at once and do pagination on the frontend
      const data: MapResponse | undefined = await $api("/maps")

      if (data) {
        const res = data.values.flatMap((map) =>
          map.courses.map((course) => {
            // const fltr = course.filters.find(
            //   (filter) =>
            //     filter.mode === query.mode &&
            //     filter.teleports === query.teleports,
            // )!

            return {
              id: uuidv4(),
              name: course.name,
              map: map.name,
              tier:
                query.has_teleports === "overall"
                  ? course.filters[query.mode].nub_tier
                  : course.filters[query.mode].pro_tier,
              state: course.filters[query.mode].state,
              mappers: course.mappers,
              created_on: map.approved_at,
              // TODO: map images
              img: getUrl(),
            }
          }),
        )

        allCourses.value = res
        courses.value = res

        total.value = res.length
      } else {
        allCourses.value = []
        courses.value = []
        total.value = 0
      }
    } catch (err) {
      console.error(err)
      allCourses.value = []
      courses.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  return {
    courses,
    loading,
    query,
    total,
    getCourses,
  }
}
