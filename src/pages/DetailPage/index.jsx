import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import { Loading } from '../../assets/Loading.jsx'
import { LessThan } from '../../assets/LessThan.jsx'
import { GreaterThan } from '../../assets/GreaterThan.jsx'
import { ArrowLeft } from '../../assets/ArrowLeft.jsx'
import { Balance } from '../../assets/Balance.jsx'
import { Vector }  from '../../assets/Vector.jsx'
import Type from '../../components/Type.jsx'
import BaseStat from '../../components/BaseStat.jsx'
import DamageRelations from '../../components/DamageRelations.jsx';
import DamageModal from '../../components/DamageModal.jsx'


const DetailPage = () => { 

  const [pokemon, setPokemon] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const params = useParams();
  const pokemonId = params.id;

  const baseUrl = `https://pokeapi.co/api/v2/pokemon/`;


  useEffect(() => {
    setIsLoading(true);
    fetchPokemonData(pokemonId);
  },[pokemonId])

  async function fetchPokemonData(id) {
    const url = `${baseUrl}${id}`
    try {
      const {data: pokemonData} = await axios.get(url);
      if(pokemonData) {
        const { name, id, types, weight, height, stats, abilities, sprites } = pokemonData;
        
        const nextAndPreviousPokemon = await getNextAndPreviousPokemon(id);

        // console.log('원래 복잡하게 나오던 타입',abilities)
        // console.log('심플해졌쬬? 타입이 ',formatPokemonAbilities(abilities))

        const DamageRelations = await Promise.all(
          types.map(async (i) => {
           // console.log('I', i);
            // 타입에 대한 상세 정보 가져오기
            const type = await axios.get(i.type.url);
            //console.log('타입', type);
            return type.data.damage_relations
          })
        )
        const formattedPokemonData = {
          id: id,
          name: name,
          weight: weight / 10,
          height: height /10,
          previous: nextAndPreviousPokemon.previous,
          next: nextAndPreviousPokemon.next,
          abiliteis: formatPokemonAbilities(abilities),
          stats: formatPokemonStats(stats),
          DamageRelations,
          types: types.map(type => type.type.name),
          sprites: formatPokemonSprites(sprites),
          description: await getPokemonDescription(id)

        }
          setPokemon(formattedPokemonData);
          setIsLoading(false);
          // console.log(formattedPokemonData)
      }
     // console.log('포케몬데이터터터터',pokemonData)
    } catch (error) {
      console.error(error)
      setIsLoading(false);
      
    }
  }
  filterAndFormatDescription = (flavorText) => {
      const koreanDescriptions = flavorText
        ?.filter((text) => text.language.name === "ko")
        .map((text) => text.flavor_text.replace(/\r|\n|\f/g, ' '))

      return koreanDescriptions;

  }

  const getPokemonDescription = async (id) => {
    const url = `https://poketapi.co/api/v2/pokemon-species/${id}`
    const { data: pokemonSpecies } = await axios.get(url)
    
   const desciptions = filterAndFormatDescription(pokemonSpecies.flavor_text_entries)
    return desciptions[Math.floor(Math.random() * desciptions.length)]
  }

  const formatPokemonSprites = (sprites) => {
    const newSprites = { ...sprites };
    //console.log(Object.keys(newSprites));

    (Object.keys(newSprites).forEach(key => {
      if(typeof newSprites[key] !== 'string') {
          delete newSprites[key];
      }
    }));
    //console.log(newSprites);
    return Object.values(newSprites)
  
  }


  //스탯들
  const formatPokemonStats = ([
      statHP,
      statATK,
      statDEP,
      statSATK,
      statSDEP,
      statSPD
  ]) => [
    {name: 'Hit Points', baseStat: statHP.base_stat},
    {name: 'Attack', baseStat: statATK.base_stat},
    {name: 'Defense', baseStat: statDEP.base_stat},
    {name: 'Special Attack', baseStat: statSATK.base_stat},
    {name: 'Special Defense', baseStat: statSDEP.base_stat},
    {name: 'Speed', baseStat: statSPD.base_stat},
  ] 
  // 타입 
  const formatPokemonAbilities = (abilities) => {
    // 타입 두개까지만 가져오기 
    return abilities.filter((_, index) => index <= 1)
    // 타입 이름에 - < 이거 띄어쓰기로 대체
                     .map((obj) => obj.ability.name.replaceAll('-',' '))
  }
  async function getNextAndPreviousPokemon(id) {

    // limit 이 1이라서 offset이 6이더라도 7을 반환하기 때문에 한개 빼주기 -1 
    const urlPokemon = `${baseUrl}?limit=1&offset=${id - 1}`;
    const { data: pokemonData } =  await axios.get(urlPokemon);

    //console.log('지금 보고있는 포켓몬 데이터',pokemonData);
    //다음포켓몬 url 가져오기 
   // console.log('다음포켓몬 유알엘',pokemonData.next)

    // next url로 axios에 데이터 요청하기 
    const nextResponse = pokemonData.next && (await axios.get(pokemonData.next))
   // console.log('다음 포켓몬 데이터 ',nextResponse)
    // 한개 전 포켓몬 가져오기 
    const previousResponse = pokemonData.previous && (await axios.get(pokemonData.previous))
   // console.log('전 포켓몬데이터 ',previousResponse)
    return {
      next: nextResponse?.data?.results?.[0]?.name,
      previous: previousResponse?.data?.results?.[0]?.name
    }
  }
  if(isLoading) {
       return (
            <div className={
              `absolute h-auto w-auto top-1/3 -translate-x1/2 left-1/2 z-50`
            }>
              <Loading className='w-12 h-12 z-50 animate-spin text-slate-900'/>
            </div>
       )
    }
    if(!isLoading && !pokemon) {
      return (
        <div>...NOT Found</div>
      )
    }
    const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon?.id}.png`;
    const bg =`bg-${pokemon?.types?.[0]}`;
    const text = `text-${pokemon?.types?.[0]}`;

    return (
      <article className='flex items-center gap-1 flex-col w-full'>
        <div
          className = {
            `${bg}  w-auto h-full flex flex-col z-0 items-center justify-end relative overflow-hidden`
          }>
            {pokemon.previous && (
              <Link 
                className='absolute top-[40%] -translate-y-1/2 z-50 left-1'
                to={`/pokemon/${pokemon.previous}`}>
                <LessThan
                    className='w-5 h-8 p-1' />
              </Link>
            )}
            {pokemon.next && (
              <Link 
                className='absolute top-[40%] -translate-y-1/2 z-50 right-1'
                to={`/pokemon/${pokemon.next}`}>
                <GreaterThan
                  className='w-5 h-8 p-1'
                 />    
              </Link>
            )}

              <section className='w-full flex flex-col z-20 items-center justify-end reltive h-full'>
                <div className='absoulte z-30 top-6 flex items-center w-full justify-between px-2'>
                    <div className='flex items-center gap-1'>
                      <Link to="/">
                          <ArrowLeft className='w-6 h-8 text-zinc-200' />
                      </Link>
                      <h1 className='text-zinc-200 font-bold text-xl capitalize'>
                          {pokemon.name}
                      </h1>
                    </div>
                    <div className='text-zinc-200 font-bold text-md'>
                          #{pokemon.id.toString().padStart(3, '00')}
                    </div>
                </div>
               
                <div className='relative h-auto max-w-[15.5rem] z-20 mt-6 -mb-16'>
                    <img 
                      src={img}
                      width="100%"
                      height="auto"
                      laoding="lazy"
                      alt={pokemon.name}
                      className={`object-contain h-full`}
                      onClick={() => setIsModalOpen(true)}
                    
                    />
                </div>
              </section>
              <section className='w-full min-h-[65%] h-full bg-gray-800 z-10 pt-14 flex flex-col items-center gap-3 px-5 pb-4'>
                  <div className='flex items-center justify-center gap-4'>
                    {/* 포케몬 타입 */}
                    {pokemon.types.map((type) => (
                      <Type key={type} type={type}/>
                    ))}

                  </div>
                  <h2 className={`text-base font-semibold ${text}`}>
                      정보
                  </h2>

                  <div className='flex w-full items-center justify-between max-w-[400px] text-center'>
                  
                      <div className='w-full '>
                        <h4 className='text-[0.5rem] text-zinc-100'>weight</h4>
                        <div className='text-sm flex mt-1 gap-2 justify-center text-zinc-200'>
                          <Balance />
                          {pokemon.weight}kg
                        </div>
                      </div>

                      <div className='w-full '>
                        <h4 className='text-[0.5rem] text-zinc-100'>height</h4>
                        <div className='text-sm flex mt-1 gap-2 justify-center text-zinc-200'>
                          <Vector />
                          {pokemon.height}m
                        </div>
                      </div>

                      <div className='w-full '>
                        <h4 className='text-[0.5rem] text-zinc-100'>ability</h4>
                        {pokemon.abiliteis.map((ability) => (
                          <div key={ability} className='text-[0.5rem] text-zinc-100 capitalize'>
                            {ability}
                          </div>
                        ))}
                      </div>

                  </div>

                  <h2 className={`text-base font-semibold ${text}`}>
                      기본 능력치 
                  </h2>
                  <div className='w-full '>
                     <table>
                      <tbody>
                        {pokemon.stats.map((stat)=> (
                          <BaseStat
                              key={stat.name}
                              valueStat={stat.baseStat}
                              nameStat={stat.name}
                              type={pokemon.types[0]}
                          />
                        ))}
                      </tbody>
                     </table>
                  </div>
                  
                  <h2 className={`text-base font-semibold ${text}`}>
                    설명
                  </h2>
                  <p className='text-md leading-4 font-sans text-zinc-200 max-w-[30rem] text-center'>
                      {pokemon.desciptions}
                  </p>




                  <div className='flex my-8 flex-wrap justify-center'>
                          {pokemon.sprites.map((url,index) => (
                            <img 
                              key={index}
                              src={url}
                              alt="sprites"
                            />
                          ))}
                    </div>  
                  
          
              </section>
                  
        </div>    
        { isModalOpen &&
                     <DamageModal 
                        setIsModalOpen={setIsModalOpen}
                        damages={pokemon.DamageRelations} 
                    />
                   }
                   <DamageModal  />
      </article>
      
    )
}

export default DetailPage