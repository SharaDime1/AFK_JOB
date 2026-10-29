"""Create the initial content dataset from the supplied brief; no network access."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
for folder in ['public/assets/js', 'public/assets/css', 'public/assets/img', 'public/assets/fonts', 'tools/screens']:
    (root / folder).mkdir(parents=True, exist_ok=True)
prices = []
def add(id, audience, category, name, price, count=None, trainer='', detail='', minutes=None, days=None, times=None, note=''):
    prices.append(dict(id=id, audience=audience, category=category, name=name, price=price, count=count, trainer=trainer, detail=detail, minutes=minutes, days=days or [], times=times or [], note=note, active=True))
uncertain = 'уточняйте у администратора'
add('gym12','women','gym','Тренажёрный зал',10000,12,detail='12 тренировок',note=uncertain)
add('gym8','women','gym','Тренажёрный зал',8000,8,detail='8 тренировок',note=uncertain)
add('personal-arzu','women','personal','Персональные занятия',25000,trainer='Арзу',note=uncertain)
add('personal-aziza','women','personal','Персональные занятия',25000,trainer='Азиза',note=uncertain)
add('individual','women','personal','Индивидуальные тренировки',100000,trainer='Азиза',note=uncertain)
add('azifit','women','group','AziFit программа для похудения',35000,12,'Азиза','12 тренировок',days=[1,3,5],times=['20:00–21:00'])
add('burn','women','group','Жиротопка',20000,8,'Алинур','8 тренировок',days=[2,4],times=['09:00–10:00','19:00–20:00'])
add('mix','women','group','Fitness Mix',20000,8,'Алинур','8 тренировок',days=[2,4],times=['18:00–19:00'])
add('intimate','women','group','Интимная гимнастика и фитнес камасутра',35000,8,'Арайлым','8 тренировок',days=[1,4],times=['11:00–12:00'])
for minutes, values in [(30,[(1,9800),(5,37990),(10,65990),(15,92990)]),(45,[(1,12990),(5,54990),(10,89990),(15,125990),(20,149990)])]:
    for count,price in values:
        add(f'lpg{minutes}-{count}','women','lpg','LPG-массаж',price,count,detail='Разовое' if count==1 else f'{count} процедур',minutes=minutes)
add('stretch','women','stretch','Стретчинг',None,note=uncertain)
for slug,trainer,p12,p8 in [('amir','Амир',96000,64000),('damir','Дамир',96000,64000),('aziza','Азиза',108000,75000)]:
    add(f'afk-{slug}-1','kids','afk','АФК и Сенсорная Интеграция',10000,1,trainer,'Разовая')
    if slug=='amir':
        add('afk-group','kids','afk','АФК и Сенсорная Интеграция',30000,12,trainer,'Групповая программа · 12 занятий',days=[1,3,5],times=['19:00–20:00'])
    add(f'afk-{slug}-12','kids','afk','АФК и Сенсорная Интеграция',p12,12,trainer,'12 тренировок в месяц' if slug=='amir' else '12 тренировок')
    add(f'afk-{slug}-8','kids','afk','АФК и Сенсорная Интеграция',p8,8,trainer,'8 тренировок в месяц' if slug=='amir' else '8 тренировок')
    if slug=='aziza': add('afk-split','kids','afk','Сплит',75000,trainer=trainer,note=uncertain)
add('speech1','kids','speech','Логопед',8000,1,detail='Разовая · 1 индивидуальное занятие')
add('speech12','kids','speech','Логопед',96000,12,detail='12 занятий в месяц · 12 индивидуальных занятий; системная работа и прогресс; поддержка и рекомендации логопеда')
add('speech8','kids','speech','Логопед',64000,8,detail='8 занятий в месяц · 8 индивидуальных занятий; планомерное развитие речи; поддержка и рекомендации логопеда')
add('intensive','kids','intensive','Интенсив',120000,12,detail='30 мин АФК + 30 мин логопед · 12 занятий')
for id,age,price in [('0','0–3 года',50000),('3','3–7 лет',60000),('7','7–12 лет',70000)]:
    add('massage'+id,'kids','massage','Детский массаж',price,detail=age+' · Фидбол и ЛФК в подарок!',note=uncertain)
schedule=[]
for p in prices:
    for time in p['times']:
        schedule.append(dict(id=p['id']+'-'+time[:2], name=p['name'],audience=p['audience'],trainer=p['trainer'],days=p['days'],time=time))
data=dict(SITE=dict(name='AziFit Studio',phone='+7 700 719 47 46',phoneHref='+77007194746',whatsapp='https://wa.me/77007194746',instagram='azifit_almaty',address='Акжунис 12, Алматы',url='',hours='',pricesUpdatedAt='',showPerProcedure=False),PRICES=prices,SCHEDULE=schedule,TRAINERS=['Азиза','Арзу','Алинур','Арайлым','Амир','Дамир'],SERVICES=[dict(name='Детская гимнастика',visible=False)],UI=dict(women='Женщинам',kids='Детям',choose='Выбрать',selected='Добавлено',ask='Узнать цену',details='Подробнее',clarify=uncertain,empty='Выберите услуги в прайсе',total='Ориентировочно',confirmed='Итог подтвердит администратор',remove='Удалить',copied='Скопировано',manual='Скопируйте текст вручную',today='Сегодня',next='Ближайший день',all='Все',dayNames=['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],categories=dict(women=[['gym','Тренажёрный зал'],['personal','Персональные'],['group','Групповые'],['lpg','LPG-массаж'],['stretch','Стретчинг']],kids=[['afk','АФК и СИ'],['speech','Логопед'],['intensive','Интенсив'],['massage','Детский массаж']]),hello='Здравствуйте! Хочу записаться в AziFit Studio:',askMessage='Хочу узнать цену:',name='Имя',time='Удобное время',minutes='мин',trainer='Тренер',column='Колонка прайса',scheduleNote='Расписание могут корректировать; уточняйте у администратора',updated='Цены актуальны на',procedure='за процедуру (расчётно)'))
comments='''/* Single source of truth. COPY-DRAFT: UI labels and message templates. */
/* TODO(owner): Confirm Instagram handle, currency, price units and validity. */
/* TODO(owner): Confirm AFK column roles, group contents and Split meaning. */
/* TODO(owner): Confirm intensive availability, stretching and gymnastics details. */
/* TODO(owner): Confirm brand palette, service naming, price differences and LPG duration. */
/* TODO(owner): Supply domain, hours, precise address, real photos and logo. */
'''
(root/'public/assets/js/data.js').write_text(comments+'window.AZIFIT = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print(f'Created data.js: {len(prices)} price entries, {len(schedule)} schedule entries')
