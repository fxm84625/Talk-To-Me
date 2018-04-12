import sys

numRecent = sys.argv[1]
scoreArray = sys.argv[2].split(',')
comparativeScoreArray = sys.argv[3].split(',')
tokensArray = sys.argv[4].split(',')
wordsArray = sys.argv[5].split(',')
positiveArray = sys.argv[6].split(',')
negativeArray = sys.argv[7].split(',')

sumScore = 0
for score in scoreArray:
    sumScore += float( score )
avgScore = sumScore / len( scoreArray )

sumComparativeScore = 0
for comparativeScore in comparativeScoreArray:
    sumComparativeScore += float( comparativeScore )
avgComparativeScore = sumComparativeScore / len( comparativeScoreArray )

response = ''
response += 'Total Score: ' + str( sumScore ) + ', '
response += 'Avg Score: ' + str( avgScore ) + ', '
response += 'Total Comparative Score: ' + str( sumComparativeScore ) + ', '
response += 'Avg Comparative Score: ' + str( avgComparativeScore )
print( response )

