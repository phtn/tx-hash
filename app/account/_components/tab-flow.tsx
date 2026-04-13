import { type ActionTab } from './action-tabs'
import { FlowListColumn, type FlowNode } from './flow'

interface ActionTabFlowProps {
  tab: ActionTab
  path: string[]
  onSelect: (level: number, nodeId: string) => void
}
export const ActionTabFlow = ({ tab, path, onSelect }: ActionTabFlowProps) => {
  const columns: Array<{
    eyebrow: string
    title: string
    description: string
    items: FlowNode[]
    activeId?: string
    level: number
  }> = [
    {
      eyebrow: 'Sections',
      title: tab.label,
      description: tab.description,
      items: tab.nodes,
      activeId: path[0],
      level: 0
    }
  ]

  let selectedNode: FlowNode | undefined
  let currentNodes = tab.nodes

  for (let index = 0; index < path.length; index += 1) {
    const nextNode = currentNodes.find((node) => node.id === path[index])
    if (!nextNode) {
      break
    }

    selectedNode = nextNode

    if (!nextNode.children?.length) {
      break
    }

    columns.push({
      eyebrow: nextNode.eyebrow,
      title: nextNode.label,
      description: nextNode.description,
      items: nextNode.children,
      activeId: path[index + 1],
      level: index + 1
    })

    currentNodes = nextNode.children
  }

  const compactContent = selectedNode?.content ?? tab.summary

  return (
    <div className='flex h-full min-w-0 bg-white/50 dark:bg-card/60'>
      <div className='flex min-w-0 flex-1 xl:hidden'>
        <section className='flex min-w-0 flex-1 flex-col bg-white dark:bg-[#050505]'>
          <div className='border-b border-black/8 px-5 py-4 dark:border-white/10'>
            <p className='font-mono text-[10px] uppercase tracking-[0.34em] text-[#7f7368] dark:text-white/34'>
              Workspace
            </p>
            <h2 className='mt-2 text-[1.45rem] font-medium leading-none tracking-[-0.05em] text-[#18120f] dark:text-white'>
              {tab.label}
            </h2>
            <p className='mt-3 text-sm leading-6 text-[#675d53] dark:text-white/54'>{tab.description}</p>
          </div>

          <div className='flex-1 overflow-y-auto p-4'>{compactContent}</div>
        </section>
      </div>

      <div className='hidden min-w-0 flex-1 xl:flex'>
        <div className='flex h-full min-w-0 overflow-x-auto scroll-smooth'>
          {columns.map((column) => (
            <FlowListColumn
              key={`${tab.id}-${column.level}-${column.title}`}
              eyebrow={column.eyebrow}
              title={column.title}
              description={column.description}
              items={column.items}
              activeId={column.activeId}
              level={column.level}
              onSelect={onSelect}
            />
          ))}
          {selectedNode?.content ?? tab.summary}
        </div>
      </div>
    </div>
  )
}
