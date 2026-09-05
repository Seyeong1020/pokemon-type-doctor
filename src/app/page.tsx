"use client";

import { useState } from "react";

type TypeId =
  | "normal" | "fire" | "water" | "electric" | "grass" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

type PokemonQuestion = {
  name: string;
  types: TypeId[];
  img: string;
};

const types: { id: TypeId; name: string; color: string }[] = [
  { id: "normal", name: "노말", color: "#918c7f" },
  { id: "fire", name: "불꽃", color: "#d94b2f" },
  { id: "water", name: "물", color: "#2d72c8" },
  { id: "electric", name: "전기", color: "#d19a12" },
  { id: "grass", name: "풀", color: "#3f9149" },
  { id: "ice", name: "얼음", color: "#4da6b4" },
  { id: "fighting", name: "격투", color: "#a63a31" },
  { id: "poison", name: "독", color: "#8750a8" },
  { id: "ground", name: "땅", color: "#ad7c3d" },
  { id: "flying", name: "비행", color: "#6f84c4" },
  { id: "psychic", name: "에스퍼", color: "#cc4b79" },
  { id: "bug", name: "벌레", color: "#789633" },
  { id: "rock", name: "바위", color: "#927d45" },
  { id: "ghost", name: "고스트", color: "#62548d" },
  { id: "dragon", name: "드래곤", color: "#5e58c9" },
  { id: "dark", name: "악", color: "#4f433b" },
  { id: "steel", name: "강철", color: "#708590" },
  { id: "fairy", name: "페어리", color: "#c9699b" },
];

const chart: Record<TypeId, Partial<Record<TypeId, number>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

const fallbackQuestions: PokemonQuestion[] = [
  { name: "리자몽", types: ["fire", "flying"] as TypeId[], img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png" },
  { name: "거북왕", types: ["water"] as TypeId[], img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png" },
  { name: "피카츄", types: ["electric"] as TypeId[], img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" },
  { name: "이상해꽃", types: ["grass", "poison"] as TypeId[], img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png" },
  { name: "팬텀", types: ["ghost", "poison"] as TypeId[], img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png" },
];

const questionCountOptions = [5, 10, 15, 20, 30];
const apiBase = "https://pokeapi.co/api/v2";

function typeName(id: TypeId) {
  return types.find((type) => type.id === id)?.name ?? id;
}

function typeColor(id: TypeId) {
  return types.find((type) => type.id === id)?.color ?? "#777";
}

function multiplier(attack: TypeId, defenders: TypeId[]) {
  return defenders.reduce((total, defender) => total * (chart[attack][defender] ?? 1), 1);
}

function bestTypes(defenders: TypeId[]) {
  const scored = types.map((type) => ({ ...type, score: multiplier(type.id, defenders) }));
  const best = Math.max(...scored.map((type) => type.score));
  return scored.filter((type) => type.score === best);
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function isTypeId(value: string): value is TypeId {
  return types.some((type) => type.id === value);
}

function idFromUrl(url: string) {
  return Number(url.split("/").filter(Boolean).at(-1));
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("데이터를 불러오지 못했습니다.");
  return response.json() as Promise<T>;
}

async function loadAllSpecies() {
  type NamedResource = { name: string; url: string };
  type GenerationList = { results: NamedResource[] };
  type Generation = { pokemon_species: NamedResource[] };

  const generationList = await getJson<GenerationList>(`${apiBase}/generation?limit=100`);
  const generations = await Promise.all(
    generationList.results.map((generation) => getJson<Generation>(generation.url)),
  );
  const speciesById = new Map<number, string>();

  for (const generation of generations) {
    for (const species of generation.pokemon_species) {
      const id = idFromUrl(species.url);
      if (Number.isFinite(id)) speciesById.set(id, species.name);
    }
  }

  return [...speciesById.entries()].map(([id, name]) => ({ id, name }));
}

async function loadPokemonQuestion(species: { id: number; name: string }): Promise<PokemonQuestion | null> {
  type PokemonResponse = {
    sprites: { front_default: string | null };
    types: { type: { name: string } }[];
  };
  type SpeciesResponse = {
    names: { name: string; language: { name: string } }[];
  };

  const [pokemon, speciesDetail] = await Promise.all([
    getJson<PokemonResponse>(`${apiBase}/pokemon/${species.id}`),
    getJson<SpeciesResponse>(`${apiBase}/pokemon-species/${species.id}`),
  ]);
  const pokemonTypes = pokemon.types.map((slot) => slot.type.name).filter(isTypeId);
  if (!pokemonTypes.length || !pokemon.sprites.front_default) return null;

  return {
    name: speciesDetail.names.find((name) => name.language.name === "ko")?.name ?? species.name,
    types: pokemonTypes,
    img: pokemon.sprites.front_default,
  };
}

async function loadQuizQuestions(count: number) {
  try {
    const species = shuffle(await loadAllSpecies()).slice(0, count);
    const loaded = await Promise.all(species.map(loadPokemonQuestion));
    const quizQuestions = loaded.filter((question): question is PokemonQuestion => question !== null);

    if (quizQuestions.length > 0) return { questions: quizQuestions, fromApi: true };
  } catch {
    // PokeAPI가 막히거나 느릴 때도 퀴즈 자체는 시작되게 둡니다.
  }

  return {
    questions: shuffle(fallbackQuestions).slice(0, Math.min(count, fallbackQuestions.length)),
    fromApi: false,
  };
}

export default function Home() {
  const [mode, setMode] = useState<"home" | "quiz" | "study" | "result">("home");
  const [questionCount, setQuestionCount] = useState(10);
  const [quizQuestions, setQuizQuestions] = useState<PokemonQuestion[]>(fallbackQuestions);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<TypeId | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  const question = quizQuestions[questionIndex] ?? fallbackQuestions[0];
  const answers = bestTypes(question.types);
  const selectedScore = selected ? multiplier(selected, question.types) : null;
  const isCorrect = !!selected && answers.some((type) => type.id === selected);

  async function startQuiz() {
    setLoading(true);
    const loaded = await loadQuizQuestions(questionCount);

    setQuizQuestions(loaded.questions);
    setUsedFallback(!loaded.fromApi);
    setMode("quiz");
    setQuestionIndex(0);
    setSelected(null);
    setChecked(false);
    setScore(0);
    setLoading(false);
  }

  function chooseType(type: TypeId) {
    if (checked) return;

    setSelected(type);
    setChecked(true);

    if (answers.some((answer) => answer.id === type)) {
      setScore((prev) => prev + 1);
    }
  }

  function nextQuestion() {
    if (!checked) return;

    if (questionIndex >= quizQuestions.length - 1) {
      setMode("result");
      return;
    }

    setSelected(null);
    setChecked(false);
    setQuestionIndex((prev) => prev + 1);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <button className="brand" onClick={() => setMode("home")}>
          <span className="brand-mark">상</span>
          <span>
            <strong>포켓몬상성박사</strong>
            <small>효과는 굉장했다</small>
          </span>
        </button>
          <div className="menu">
          <button className="menu-button" onClick={startQuiz} disabled={loading}>퀴즈</button>
          <button className="menu-button" onClick={() => setMode("study")}>공부</button>
        </div>
      </header>

      {mode === "home" && (
        <section className="gameboy home">
          <div className="lcd home-lcd">
            <div>
              <p className="tiny-label">타입 상성 훈련기</p>
              <h1>포켓몬상성박사</h1>
              <p className="lead">상대 타입을 보고 가장 아픈 공격 타입을 바로 고르는 연습.</p>
            </div>
            <img src={fallbackQuestions[0].img} alt="리자몽 스프라이트" />
          </div>

          <div className="count-picker" aria-label="문제 수 선택">
            <span>문제 수</span>
            {questionCountOptions.map((count) => (
              <button
                className={questionCount === count ? "count-button active" : "count-button"}
                key={count}
                onClick={() => setQuestionCount(count)}
              >
                {count}
              </button>
            ))}
          </div>

          <div className="controls">
            <button className="main-action" onClick={startQuiz} disabled={loading}>
              {loading ? "불러오는 중" : "퀴즈 시작"}
            </button>
            <button className="sub-action" onClick={() => setMode("study")}>상성 공부</button>
          </div>
        </section>
      )}

      {mode === "quiz" && (
        <section className="gameboy quiz">
          <div className="quiz-screen">
            <div className="lcd monster-panel">
              <div className="quiz-meta">
                <span>문제 {questionIndex + 1} / {quizQuestions.length}</span>
                <span>점수 {score}</span>
              </div>
              <img src={question.img} alt={`${question.name} 스프라이트`} />
              <h2>{question.name}</h2>
              <div className="type-row">
                {question.types.map((id) => (
                  <span className="pill" style={{ background: typeColor(id) }} key={id}>
                    {typeName(id)}
                  </span>
                ))}
              </div>
            </div>

            <div className="quiz-pad">
              <h2>가장 효과적인 공격 타입은?</h2>
              <div className="type-grid">
                {types.map((type) => (
                  <button
                    className={selected === type.id ? "type-btn selected" : "type-btn"}
                    key={type.id}
                    onClick={() => chooseType(type.id)}
                    style={{ background: type.color }}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {checked && selected && (
            <div className="modal-backdrop">
              <button className="answer-modal" onClick={nextQuestion}>
                <strong className={isCorrect ? "ok" : "no"}>{isCorrect ? "정답!" : "아쉬워요!"}</strong>
                <span>
                  {typeName(selected)} 공격은 {selectedScore}배
                </span>
                <small>
                  정답 후보: {answers.map((type) => `${type.name} ${type.score}배`).join(", ")}
                </small>
                <small>
                  {question.types.map((id) => `${typeName(id)} ${(chart[selected][id] ?? 1)}배`).join(" × ")} = {selectedScore}배
                </small>
                <em>{questionIndex >= quizQuestions.length - 1 ? "눌러서 결과 보기" : "눌러서 다음 문제"}</em>
              </button>
            </div>
          )}
        </section>
      )}

      {mode === "result" && (
        <section className="gameboy result">
          <div className="lcd result-lcd">
            <p className="tiny-label">퀴즈 완료</p>
            <h1>{score} / {quizQuestions.length}</h1>
            <p className="lead">
              {usedFallback
                ? "PokeAPI 연결이 안 돼서 기본 샘플로 진행했습니다."
                : "이번 세트는 중복 없이 랜덤으로 출제했습니다."}
            </p>
          </div>
          <div className="controls">
            <button className="main-action" onClick={startQuiz} disabled={loading}>
              {loading ? "불러오는 중" : "다시 풀기"}
            </button>
            <button className="sub-action" onClick={() => setMode("home")}>처음으로</button>
          </div>
        </section>
      )}

      {mode === "study" && (
        <section className="gameboy study">
          <div className="lcd study-head">
            <div>
              <p className="tiny-label">상성 공부</p>
              <h1>방어 타입별 약점</h1>
              <p className="lead">왼쪽 타입을 상대할 때 강한 공격 타입만 빠르게 봅니다.</p>
            </div>
          </div>

          <div className="study-list">
            {types.map((defender) => {
              const strong = bestTypes([defender.id]);
              return (
                <div className="study-card" key={defender.id}>
                  <span className="pill" style={{ background: defender.color }}>{defender.name}</span>
                  <strong>{strong.map((type) => type.name).join(", ")}</strong>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
