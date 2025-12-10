import { defineComponent, ref, type ComponentPublicInstance } from "vue";
import ScrollSyncGroup from "@/components/ScrollSyncGroup";
import "./GroupedTablesSection.pcss";

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
          <div class="empty-state">
            <div class="empty-icon">📊</div>
            <h3>暂无镜像数据</h3>
            <p>未找到镜像列表。</p>
          </div>
        );
      }

      return (
        <div class="grouped-tables-section">
          <ScrollSyncGroup watch-keys={props.groups}>
            {{
              default: ({
                setRef,
              }: {
                setRef: (el: Element | ComponentPublicInstance | null) => void;
              }) => (
                <>
                  <div class="groups-nav">
                    {props.groups.map((g) => (
                      <div key={g.tag1} class="group-row">
                        <button class="tag1-button" onClick={() => scrollToTag1(g.tag1)}>
                          {g.tag1}
                        </button>
                        <div class="group-row-tag2">
                          {g.subgroups.map((sg) => (
                            <button
                              key={sg.tag2}
                              class="tag2-group-tab"
                              onClick={() => scrollToTag2(g.tag1, sg.tag2)}
                            >
                              {sg.tag2}
                              <span class="chart-count">({sg.items.length})</span>
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
                      class="tag1-group-container"
                    >
                      <div class="tag1-group-header">
                        <div class="tag1-group-title">
                          <input
                            type="checkbox"
                            class="select-checkbox"
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
                          <span class="tag1-badge">分类 {g.tag1}</span>
                        </div>
                      </div>

                      {g.subgroups.map((sg) => (
                        <div
                          key={sg.tag2}
                          id={`tag2-group-${slugifyTag(g.tag1)}-${slugifyTag(sg.tag2)}`}
                          class="tag2-section"
                        >
                          <h3 class="tag2-title">
                            <input
                              type="checkbox"
                              class="select-checkbox"
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
                          <div class="table-wrapper" ref={setRef}>
                            <table class="tables-table">
                              <colgroup>
                                <col class="col-select" />
                                <col class="col-symbol" />
                                <col class="col-name" />
                                <col class="col-mirror" />
                                <col class="col-origin" />
                              </colgroup>
                              <thead>
                                <tr>
                                  <th>选择</th>
                                  <th>符号</th>
                                  <th>名称</th>
                                  <th>镜像</th>
                                  <th>原链接</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sg.items.map((item) => (
                                  <tr key={item.url}>
                                    <td class="select-cell">
                                      <input
                                        type="checkbox"
                                        class="select-checkbox"
                                        checked={!!selectedMap.value[item.url]}
                                        onChange={(e) =>
                                          onRowChange(
                                            (e.target as HTMLInputElement).checked,
                                            item.url
                                          )
                                        }
                                      />
                                    </td>
                                    <td>{item.symbol || ""}</td>
                                    <td class="name-cell">
                                      <strong>{item.name}</strong>
                                    </td>
                                    <td class="mirror-cell">
                                      <a
                                        class="link-button mirror-link"
                                        href={item.url}
                                        title={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        镜像
                                      </a>
                                    </td>
                                    <td class="origin-cell">
                                      {item.url_ori ? (
                                        <a
                                          class="link-button origin-link"
                                          href={item.url_ori}
                                          title={item.url_ori}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          原链接
                                        </a>
                                      ) : (
                                        <span class="link-missing">无</span>
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
