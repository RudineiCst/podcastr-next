import {GetStaticProps} from 'next';
import Link from 'next/link'
import Image from 'next/image';
import Head from 'next/head';
import {format, parseISO} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import api from '../service/api';
import { convertDurationToTimeString } from '../util/convertDurationToTimeString';

import styles from './home.module.scss';
import { useContext } from 'react';
import { PlayerContext } from '../contexts/playerContext';

type Episodes ={
  id: string;
  title: string;
  members: string;
  publishedAt: string;
  thumbnail: string ;
  description:string ;
  url:string ;
  duration: number ;
  durationAsString: string;
}

type homeProps ={
  latestEpisodes:  Episodes[],
  allEpisodes:  Episodes[],
}

export default function Home({latestEpisodes, allEpisodes}: homeProps) {
  const {playList} = useContext(PlayerContext);

  const episodesList= [...latestEpisodes, ...allEpisodes];
 
  return (
    <div className={styles.homepage}>

       <Head>
         <title>Home | podcastr</title>
       </Head>

    <section className={styles.latestEpisodes}>
      <h2>Últimos lançamentos</h2>

      <ul>
        {latestEpisodes.map((episode, index) => {
          return (
            <li key={episode.id}>
              <Image 
                width ={192}
                height ={192}
                src={episode.thumbnail} 
                alt={episode.title}
                objectFit="cover"
                />

              <div className={styles.episodesDetails}>
                <Link href={`episodes/${episode.id}`}>
                   {episode.title}
                </Link>
                <p>{episode.members}</p>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
              </div>
              
              <button type="button"  onClick={() => playList(episodesList, index)}>
                <img src="/play-green.svg" alt="Tocar episódio"/>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
    <section className={styles.allEpisodes}>
      <h2>Todos os episódios</h2>

      <table cellSpacing={0}>
        <thead>
          <tr>
            <th></th>
            <th>Podcast</th>
            <th>Integrantes</th>
            <th>Data</th>
            <th>Duração</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {allEpisodes.map((episode, index) => {
            return (
              <tr key={episode.id}>
                <td style={{width: 75}}>
                  <Image
                    width={120}
                    height={120}
                    objectFit="cover"
                    src={episode.thumbnail}
                    alt={episode.title}
                  />
                </td>
                <td>
                  <Link href={`episodes/${episode.id}`}>
                    <a href="">{episode.title}</a>
                  </Link>
                </td>
                <td>{episode.members}</td>
                <td style={{width: 100}}>{episode.publishedAt}</td>
                <td>{episode.durationAsString}</td>
                <td>
                  <button type="button"  onClick={() => playList(episodesList, index + latestEpisodes.length)}>
                    <img src="/play-green.svg" alt="Tocas episódio"/>
                  </button>
                </td>


              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
   
    </div>
   
  )
}
export const getStaticProps: GetStaticProps = async() =>{
  const { data } = await api.get('episodes',{
    params:{
      _limit: 12,
      _sort: 'published_at',
      _order:'desc'
    }
  })
  const episodes = data.map(episode => {
    return { 
      id: episode.id,
      title: episode.title,
      members: episode.members,
      publishedAt: format(
        parseISO(episode.published_at),
       'd MMM yy',{
         locale: ptBR
        }),
      thumbnail: episode.thumbnail,
      description: episode.description,
      url: episode.file.url,
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration))
    }
  })

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);
  return {
    props: {
      allEpisodes,
      latestEpisodes,
      },
    revalidate: 60 * 60 * 8
    }
  }