import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { FriendActions } from "@/components/friends/FriendActions";
import { PlayerStyleCard } from "@/components/matches/PlayerStyleCard";
import { WinRateCard } from "@/components/matches/WinRateCard";
import {
  getFriendProfile,
  getFriendship,
  getUserPublicPreview,
  relationFromFriendship,
} from "@/lib/db/queries";
import { getServerDictionary } from "@/lib/i18n/server";
import { requireProfile } from "@/lib/session";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { session, profile } = await requireProfile();
  const dict = await getServerDictionary();
  const { id } = await params;

  if (id === session.user.id) redirect("/settings");

  const preview = await getUserPublicPreview(id);
  if (!preview) notFound();

  const friendship = await getFriendship(session.user.id, id);
  const relation = relationFromFriendship(session.user.id, friendship);
  const full = relation === "accepted" ? await getFriendProfile(session.user.id, id) : null;

  return (
    <div>
      <AppNav ptcglName={profile.ptcglName} />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <div>
          <Link href="/friends" className="text-sm text-[var(--accent)] hover:underline">
            ← {dict.userProfile.backToFriends}
          </Link>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl text-[var(--ink)]">{preview.ptcglName}</h1>
              <p className="text-sm text-[var(--muted)]">{preview.displayName}</p>
            </div>
            <FriendActions
              userId={preview.userId}
              friendshipId={friendship?.id ?? null}
              relation={relation}
            />
          </div>
        </div>

        {full ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <WinRateCard
                title={dict.dashboard.overall}
                wins={full.stats.wins}
                losses={full.stats.losses}
                winRate={full.stats.winRate}
                gamesLine={dict.dashboard.gamesLine}
              />
              <WinRateCard
                title={dict.dashboard.goingFirst}
                wins={full.stats.first.wins}
                losses={full.stats.first.total - full.stats.first.wins}
                winRate={full.stats.first.winRate}
                gamesLine={dict.dashboard.gamesLine}
              />
              <WinRateCard
                title={dict.dashboard.goingSecond}
                wins={full.stats.second.wins}
                losses={full.stats.second.total - full.stats.second.wins}
                winRate={full.stats.second.winRate}
                gamesLine={dict.dashboard.gamesLine}
              />
            </div>

            <PlayerStyleCard
              matchCount={full.matchCount}
              readOnly
              initialAssessment={
                full.assessment
                  ? {
                      matchCount: full.assessment.matchCount,
                      archetype: full.assessment.archetype,
                      summary: full.assessment.summary,
                      strengths: full.assessment.strengths,
                      weaknesses: full.assessment.weaknesses,
                      focus: full.assessment.focus,
                      rawJson: full.assessment.rawJson,
                    }
                  : null
              }
            />

            <section className="space-y-3">
              <h2 className="font-display text-xl text-[var(--ink)]">
                {dict.userProfile.decksTitle}
              </h2>
              {full.decks.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">{dict.userProfile.noDecks}</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {full.decks.map((deck) => {
                    const total = deck.wins + deck.losses;
                    const pct = total ? Math.round((deck.wins / total) * 1000) / 10 : 0;
                    return (
                      <Link
                        key={deck.id}
                        href={`/users/${preview.userId}/decks/${deck.id}`}
                        className="ui-card p-4 transition hover:bg-[var(--wash)]"
                      >
                        <p className="font-medium text-[var(--ink)]">{deck.name}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {dict.decks.cardsLine(
                            deck.totalCards,
                            deck.pokemonCount,
                            deck.trainerCount,
                            deck.energyCount,
                          )}
                        </p>
                        <p className="mt-1 text-sm text-[var(--ink)]">
                          {total
                            ? dict.decks.winRateLine(pct, deck.wins, deck.losses)
                            : dict.decks.noMatchesYet}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
            {dict.userProfile.privateHint}
          </p>
        )}
      </main>
    </div>
  );
}
