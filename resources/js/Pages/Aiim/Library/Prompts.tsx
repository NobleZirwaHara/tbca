import { Markdown, PackBlocks, Panel, PillLink, ProtoFrame, RowsTable, Section, type PackBlock } from '@/Components/Aiim/ProtoLibrary';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps { markdown: string; master: PackBlock[]; packPrompts: (string | number | null)[][] }

/** Master Prompt and the prompt pack. */
export default function Prompts({ markdown, master, packPrompts }: Props) {
    return (
        <ProtoFrame title="Master Prompt" crumbs={[{ label: 'Master Prompt' }]}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
                <article className="min-w-0 rounded-[12px] border border-parchment-400 bg-white p-5 sm:p-7"><Markdown src={markdown} /></article>
                <div className="grid content-start gap-4">
                    <Panel title="Source master prompt in the Country Pack">
                        <p className="mb-2 text-[0.8rem] text-ink-500">MP-AIIM-BW-1.0 produced the data this prototype renders.</p>
                        <PackBlocks blocks={master} />
                    </Panel>
                    <PillLink href="/aiim/country/botswana/coverage" tone="ghost" size="md">Coverage report →</PillLink>
                </div>
            </div>
            <Section title="Country Pack prompts BW-P0 to BW-P56 (B2)"><RowsTable rows={packPrompts} className="bg-white" /></Section>
        </ProtoFrame>
    );
}
