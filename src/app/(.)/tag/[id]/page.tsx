import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import Section from "~/app/(.)/components/section";
import { Pagination } from "~/components/pagination";
import { HeaderMain } from "~/components/ui/header";
import { api } from "~/trpc/server";

const getItem = cache(async (id: number, page: number) => {
  return await api.poem.findByTagId.query({
    id,
    page,
    pageSize: 12,
  });
});

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page: string };
}) {
  const id = Number(params.id);
  const page = Number(searchParams.page);

  if (isNaN(id) || isNaN(page) || page < 1) {
    return notFound();
  }

  const { tag } = await getItem(id, page);

  return {
    title: `关于${tag?.type || "其他"}“${tag?.name}”的诗词 第${page}页`,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page: string };
}) {
  const id = Number(params.id);
  const page = Number(searchParams.page);

  if (isNaN(id) || isNaN(page) || page < 1) {
    return notFound();
  }

  const { data: poems, tag, hasNext } = await getItem(id, page);

  if (poems.length < 1) {
    return notFound();
  }

  return (
    <>
      <HeaderMain>
        <div className="flex h-16 items-center px-4">
          <nav className="flex items-center space-x-2">
            <Link
              href="/tag"
              replace
              className="flex-shrink-0 text-muted-foreground"
            >
              {tag?.type || "其他"}
            </Link>
            <ChevronRight className="h-4 w-4 flex-shrink-0" strokeWidth={1} />
            {tag && (
              <Link className="line-clamp-1" href={`/tag/${tag.id}/1`}>
                {tag.name || "未知"}
              </Link>
            )}
          </nav>
        </div>
      </HeaderMain>

      <div className="p-4">
        <header>
          <h1 className="prose-h1">{tag?.name}</h1>
          {tag?.introduce && <p className="prose-p">{tag?.introduce}</p>}
        </header>

        <div className="mt-8 space-y-4">
          {poems.map((poem) => (
            <Section poem={poem} key={poem.id} />
          ))}
        </div>
      </div>

      <Pagination
        page={page}
        hasNext={hasNext}
        prefixUrl={`/tag/${id}/1`}
        params={`page=${page - 1}`}
      />
    </>
  );
}
