import { defineComponent, ref, type ComponentPublicInstance } from "vue";
import ScrollSyncGroup from "@/components/ScrollSyncGroup";

interface MirrorTableItem {
  name: string;
  symbol?: string;
  url: string;
  url_ori?: string;
  comment?: string;
}

interface Tag2Group {
  tag2: string;
  items: MirrorTableItem[];
}

interface Tag1Group {
  tag1: string;
  order: number;
  subgroups: Tag2Group[];
}

enum CheckboxState {
  Unchecked,
  Indeterminate,
  Checked,
}

export default defineComponent({
  name: "GroupedTablesSection",
  props: {
    groups: {
      type: Array as () => Tag1Group[],
      required: true,
    },
  },
  emits: ["update:selectedMap"],
  setup(props, { emit }) {
    const selectedMap = ref<Record<string, boolean>>({});

    function slugifyTag(tag: string): string {
      return tag
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "-");
    }

    function scrollToTag1(tag1: string): void {
      const id = `tag1-group-${slugifyTag(tag1)}`;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    function scrollToTag2(tag1: string, tag2: string): void {
      const id = `tag2-group-${slugifyTag(tag1)}-${slugifyTag(tag2)}`;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    function emitSelected(): void {
      emit("update:selectedMap", selectedMap.value);
    }

    function getTag1Urls(g: Tag1Group): string[] {
      const urls: string[] = [];
      for (const sg of g.subgroups) {
        for (const item of sg.items) {
          urls.push(item.url);
        }
      }
      return urls;
    }

    function getTag2Urls(sg: Tag2Group): string[] {
      return sg.items.map((item) => item.url);
    }

    function aggregateCheckboxState(urls: string[]): CheckboxState {
      if (urls.length === 0) return CheckboxState.Unchecked;
      let selected = 0;
      for (const u of urls) if (selectedMap.value[u]) selected++;
      if (selected === 0) return CheckboxState.Unchecked;
      if (selected === urls.length) return CheckboxState.Checked;
      return CheckboxState.Indeterminate;
    }

    function tag1State(g: Tag1Group): CheckboxState {
      return aggregateCheckboxState(getTag1Urls(g));
    }

    function tag2State(sg: Tag2Group): CheckboxState {
      return aggregateCheckboxState(getTag2Urls(sg));
    }

    function onTag1Change(checked: boolean, g: Tag1Group): void {
      for (const url of getTag1Urls(g)) {
        selectedMap.value[url] = checked;
      }
      emitSelected();
    }

    function onTag2Change(checked: boolean, sg: Tag2Group): void {
      for (const url of getTag2Urls(sg)) {
        selectedMap.value[url] = checked;
      }
      emitSelected();
    }

    function onRowChange(checked: boolean, url: string): void {
      selectedMap.value[url] = checked;
      emitSelected();
    }

    // 自定义指令：设置 indeterminate 状态
    const vIndeterminate = {
      mounted(el: Element | ComponentPublicInstance, binding: { value: boolean }): void {
        if (el instanceof HTMLInputElement) {
          el.indeterminate = !!binding.value;
        }
      },
      updated(el: Element | ComponentPublicInstance, binding: { value: boolean }): void {
        if (el instanceof HTMLInputElement) {
          el.indeterminate = !!binding.value;
        }
      },
    };

    return () => {
      if (props.groups.length === 0) {
        return (
          <div class="text-center p-12">
            <div class="text-[4rem] mb-4">📊</div>
            <h3 class="text-white mb-4">暂无镜像数据</h3>
            <p class="text-white/70">未找到镜像列表。</p>
          </div>
        );
      }

      return (
        <div class="mt-8">
          <ScrollSyncGroup watch-keys={props.groups}>
            {{
              default: ({
                setRef,
              }: {
                setRef: (el: Element | ComponentPublicInstance | null) => void;
              }) => (
                <>
                  <div class="mb-8 mt-6">
                    {props.groups.map((g) => (
                      <div key={g.tag1} class="mb-4">
                        <button
                          class="px-4 py-2 rounded-[18px] font-bold text-white cursor-pointer transition-all duration-300 ease-in-out opacity-80 bg-white/10 mr-3 hover:opacity-90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:-translate-y-0.5"
                          onClick={() => scrollToTag1(g.tag1)}
                        >
                          {g.tag1}
                        </button>
                        <div class="flex flex-wrap gap-2 mt-2">
                          {g.subgroups.map((sg) => (
                            <button
                              key={sg.tag2}
                              class="px-4 py-2 rounded-[18px] font-bold text-white cursor-pointer transition-all duration-300 ease-in-out opacity-80 bg-white/10 hover:opacity-90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:-translate-y-0.5"
                              onClick={() => scrollToTag2(g.tag1, sg.tag2)}
                            >
                              {sg.tag2}
                              <span class="text-[0.9rem] opacity-90 bg-black/20 py-[0.1rem] px-2 rounded-[10px]">
                                ({sg.items.length})
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {props.groups.map((g) => (
                    <div
                      key={g.tag1}
                      id={`tag1-group-${slugifyTag(g.tag1)}`}
                      class="mb-12 scroll-mt-[20px]"
                    >
                      <div class="mb-6 pb-4 border-b-2 border-white/10">
                        <div class="flex items-center gap-4">
                          <input
                            type="checkbox"
                            style={{ width: "22px", height: "22px", transform: "scale(1.2)" }}
                            ref={(el) => {
                              if (el) {
                                vIndeterminate.mounted(el, {
                                  value: tag1State(g) === CheckboxState.Indeterminate,
                                });
                              }
                            }}
                            checked={tag1State(g) === CheckboxState.Checked}
                            onChange={(e) =>
                              onTag1Change((e.target as HTMLInputElement).checked, g)
                            }
                          />
                          <span class="px-6 py-2 rounded-[20px] font-bold text-[1.2rem] text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] bg-[rgba(100,181,246,0.3)]">
                            分类 {g.tag1}
                          </span>
                        </div>
                      </div>

                      {g.subgroups.map((sg) => (
                        <div
                          key={sg.tag2}
                          id={`tag2-group-${slugifyTag(g.tag1)}-${slugifyTag(sg.tag2)}`}
                          class="mt-4"
                        >
                          <h3 class="text-white mt-2 mb-2 text-[1.1rem] flex items-center gap-2">
                            <input
                              type="checkbox"
                              style={{ width: "22px", height: "22px", transform: "scale(1.2)" }}
                              ref={(el) => {
                                if (el) {
                                  vIndeterminate.mounted(el, {
                                    value: tag2State(sg) === CheckboxState.Indeterminate,
                                  });
                                }
                              }}
                              checked={tag2State(sg) === CheckboxState.Checked}
                              onChange={(e) =>
                                onTag2Change((e.target as HTMLInputElement).checked, sg)
                              }
                            />
                            {sg.tag2}
                          </h3>
                          <div
                            class="overflow-x-auto rounded-[10px] bg-black/20 border border-white/10"
                            ref={setRef}
                          >
                            <table class="w-full border-collapse min-w-[800px] table-fixed">
                              <colgroup>
                                <col style={{ width: "60px" }} />
                                <col style={{ width: "120px" }} />
                                <col style={{ width: "320px" }} />
                                <col style={{ width: "160px" }} />
                                <col style={{ width: "160px" }} />
                              </colgroup>
                              <thead>
                                <tr>
                                  <th class="bg-[rgba(100,181,246,0.2)] text-white p-4 text-left font-semibold border-b-2 border-white/10">
                                    选择
                                  </th>
                                  <th class="bg-[rgba(100,181,246,0.2)] text-white p-4 text-left font-semibold border-b-2 border-white/10">
                                    符号
                                  </th>
                                  <th class="bg-[rgba(100,181,246,0.2)] text-white p-4 text-left font-semibold border-b-2 border-white/10">
                                    名称
                                  </th>
                                  <th class="bg-[rgba(100,181,246,0.2)] text-white p-4 text-left font-semibold border-b-2 border-white/10">
                                    镜像
                                  </th>
                                  <th class="bg-[rgba(100,181,246,0.2)] text-white p-4 text-left font-semibold border-b-2 border-white/10">
                                    原链接
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {sg.items.map((item) => (
                                  <tr
                                    key={item.url}
                                    class="hover:bg-white/5 last:[&>td]:border-b-0"
                                  >
                                    <td class="p-4 border-b border-white/5 text-white/90 break-words">
                                      <input
                                        type="checkbox"
                                        style={{
                                          width: "22px",
                                          height: "22px",
                                          transform: "scale(1.2)",
                                        }}
                                        checked={!!selectedMap.value[item.url]}
                                        onChange={(e) =>
                                          onRowChange(
                                            (e.target as HTMLInputElement).checked,
                                            item.url
                                          )
                                        }
                                      />
                                    </td>
                                    <td class="p-4 border-b border-white/5 text-white/90 break-words">
                                      {item.symbol || ""}
                                    </td>
                                    <td class="p-4 border-b border-white/5 text-white/90 break-words min-w-[200px]">
                                      <strong>{item.name}</strong>
                                    </td>
                                    <td class="p-4 border-b border-white/5 text-white/90 break-words min-w-[130px]">
                                      <a
                                        class="px-[0.5rem] py-[0.35rem] border-none rounded-[6px] text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-[0.2rem] min-w-[60px] no-underline text-inherit bg-[linear-gradient(135deg,#2196f3,#1565c0)] text-white hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#42a5f5,#1976d2)]"
                                        href={item.url}
                                        title={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        镜像
                                      </a>
                                    </td>
                                    <td class="p-4 border-b border-white/5 text-white/90 break-words min-w-[130px]">
                                      {item.url_ori ? (
                                        <a
                                          class="px-[0.5rem] py-[0.35rem] border-none rounded-[6px] text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-[0.2rem] min-w-[60px] no-underline text-inherit bg-[linear-gradient(135deg,#ff9800,#f57c00)] text-white hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#ffb74d,#ff9800)]"
                                          href={item.url_ori}
                                          title={item.url_ori}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          原链接
                                        </a>
                                      ) : (
                                        <span class="text-white/50">无</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              ),
            }}
          </ScrollSyncGroup>
        </div>
      );
    };
  },
});
